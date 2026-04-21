using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MediaMTX_Gui.Server.Services
{
    public class ProjectStreamService : IProjectStreamService
    {
        private readonly ApplicationDbContext _db;
        private readonly MediaMtxOptions _mediaMtxOptions;
        private readonly IMediaMtxService _mediaMtx;

        public ProjectStreamService(ApplicationDbContext db, IOptions<MediaMtxOptions> mediaMtxOptions, IMediaMtxService mediaMtx)
        {
            _db = db;
            _mediaMtxOptions = mediaMtxOptions.Value;
            _mediaMtx = mediaMtx;
        }

        public async Task<IEnumerable<ProjectStreamDto>> GetProjectStreamsForCurrentUserAsync(int projectId, ClaimsPrincipal principal)
        {
            var currentUser = await EnsureProjectMembershipAsync(projectId, principal);

            var streams = await _db.ProjectStreams
                .Where(stream => stream.ProjectId == projectId)
                .OrderByDescending(stream => stream.CreatedAt)
                .ToListAsync();

            return streams.Select(stream => MapToDto(stream, null, stream.CreatedByUserId == currentUser.Id));
        }

        public async Task<ProjectStreamDto> CreateProjectStreamAsync(int projectId, CreateProjectStreamRequest request, ClaimsPrincipal principal)
        {
            var currentUser = await EnsureProjectMembershipAsync(projectId, principal);

            var trimmedName = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(trimmedName))
            {
                throw new InvalidOperationException("Stream name is required.");
            }

            var streamId = Guid.NewGuid();
            var rawStreamKey = GenerateStreamKey();
            var path = await GenerateUniquePathAsync(projectId, trimmedName);

            var stream = new ProjectStream
            {
                Id = streamId,
                ProjectId = projectId,
                CreatedByUserId = currentUser.Id,
                Name = trimmedName,
                Path = path,
                PublishUser = $"stream-{streamId:N}",
                StreamKeyHash = HashSecret(rawStreamKey),
                CreatedAt = DateTime.UtcNow
            };

            _db.ProjectStreams.Add(stream);
            await _db.SaveChangesAsync();

            return MapToDto(stream, rawStreamKey, true);
        }

        public async Task<ProjectStreamDto> RegenerateStreamKeyAsync(int projectId, Guid streamId, ClaimsPrincipal principal)
        {
            var currentUser = await EnsureProjectMembershipAsync(projectId, principal);

            var stream = await _db.ProjectStreams
                .FirstOrDefaultAsync(candidate => candidate.Id == streamId && candidate.ProjectId == projectId);

            if (stream is null)
            {
                throw new KeyNotFoundException("Stream was not found.");
            }

            if (stream.CreatedByUserId != currentUser.Id)
            {
                throw new UnauthorizedAccessException("Only the stream owner can rotate the stream key.");
            }

            var rawStreamKey = GenerateStreamKey();
            stream.StreamKeyHash = HashSecret(rawStreamKey);
            stream.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await _mediaMtx.KickPathAsync(stream.Path);

            return MapToDto(stream, rawStreamKey, true);
        }

        public async Task DeleteStreamAsync(int projectId, Guid streamId, ClaimsPrincipal principal)
        {
            var currentUser = await EnsureProjectMembershipAsync(projectId, principal);

            var stream = await _db.ProjectStreams
                .FirstOrDefaultAsync(candidate => candidate.Id == streamId && candidate.ProjectId == projectId);

            if (stream is null)
            {
                throw new KeyNotFoundException("Stream was not found.");
            }

            if (stream.CreatedByUserId != currentUser.Id)
            {
                throw new UnauthorizedAccessException("Only the stream owner can delete this stream.");
            }

            _db.ProjectStreams.Remove(stream);
            await _mediaMtx.KickPathAsync(stream.Path);
            await _db.SaveChangesAsync();
        }

        public async Task<ProjectStreamDto> ToggleRecordingAsync(int projectId, Guid streamId, bool enabled, ClaimsPrincipal principal)
        {
            var currentUser = await EnsureProjectMembershipAsync(projectId, principal);

            var stream = await _db.ProjectStreams
                .FirstOrDefaultAsync(candidate => candidate.Id == streamId && candidate.ProjectId == projectId);

            if (stream is null)
            {
                throw new KeyNotFoundException("Stream was not found.");
            }

            if (stream.CreatedByUserId != currentUser.Id)
            {
                throw new UnauthorizedAccessException("Only the stream owner can toggle recording.");
            }

            stream.RecordingEnabled = enabled;
            stream.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return MapToDto(stream, null, true);
        }

        public async Task<bool> ValidatePublishCredentialsAsync(MediaMtxAuthRequestDto request)
        {
            if (!string.Equals(request.Action, "publish", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (string.IsNullOrWhiteSpace(request.Path) ||
                string.IsNullOrWhiteSpace(request.User) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return false;
            }

            var stream = await _db.ProjectStreams
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate =>
                    candidate.Path == request.Path &&
                    candidate.PublishUser == request.User);

            if (stream is null)
            {
                return false;
            }

            return SlowEquals(stream.StreamKeyHash, HashSecret(request.Password));
        }

        public async Task<string> FilterStreamJsonAsync(string json, ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            if (user.Role == "admin")
                return json;

            var allowedPaths = await _db.ProjectMembers
                .Where(pm => pm.UserId == user.Id)
                .Join(_db.ProjectStreams,
                    pm => pm.ProjectId,
                    ps => ps.ProjectId,
                    (pm, ps) => ps.Path)
                .ToHashSetAsync();

            var node = JsonNode.Parse(json);
            if (node?["items"] is JsonArray items)
            {
                var filtered = items
                    .Where(i => i?["name"]?.GetValue<string>() is string name && allowedPaths.Contains(name))
                    .Select(i => i?.DeepClone())
                    .ToArray();
                node["items"] = new JsonArray(filtered);
            }

            return node?.ToJsonString() ?? json;
        }

        private async Task<User> EnsureProjectMembershipAsync(int projectId, ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            var isMember = await _db.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);

            if (!isMember)
            {
                throw new UnauthorizedAccessException("You do not belong to this project.");
            }

            return user;
        }

        private async Task<User> GetCurrentPersistedUserAsync(ClaimsPrincipal principal)
        {
            var sub = principal.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(sub))
            {
                throw new UnauthorizedAccessException("Missing subject claim.");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.SubId == sub);

            if (user is null)
            {
                throw new UnauthorizedAccessException("Authenticated user was not found in the database.");
            }

            return user;
        }

        private async Task<string> GenerateUniquePathAsync(int projectId, string streamName)
        {
            var baseSlug = Slugify(streamName);
            var projectPrefix = $"project-{projectId}";

            for (var attempt = 0; attempt < 10; attempt++)
            {
                var suffix = RandomNumberGenerator.GetHexString(12).ToLowerInvariant();
                var path = $"{projectPrefix}/{baseSlug}-{suffix}";

                var exists = await _db.ProjectStreams.AnyAsync(stream => stream.Path == path);
                if (!exists)
                {
                    return path;
                }
            }

            throw new InvalidOperationException("Could not allocate a unique stream path.");
        }

        private static string GenerateStreamKey()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        private static string Slugify(string value)
        {
            var builder = new StringBuilder();
            var pendingDash = false;

            foreach (var character in value.Trim().ToLowerInvariant())
            {
                if (char.IsLetterOrDigit(character))
                {
                    if (pendingDash && builder.Length > 0)
                    {
                        builder.Append('-');
                    }

                    builder.Append(character);
                    pendingDash = false;
                    continue;
                }

                pendingDash = true;
            }

            return builder.Length == 0 ? "stream" : builder.ToString();
        }

        private static string HashSecret(string value)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
            return Convert.ToBase64String(hash);
        }

        private static bool SlowEquals(string left, string right)
        {
            var leftBytes = Encoding.UTF8.GetBytes(left);
            var rightBytes = Encoding.UTF8.GetBytes(right);

            return CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
        }

        private static string MaskSecret(string secret)
        {
            if (secret.Length <= 8)
            {
                return "********";
            }

            return $"{secret[..4]}****{secret[^4..]}";
        }

        private ProjectStreamDto MapToDto(ProjectStream stream, string? rawStreamKey, bool canRotateKey)
        {
            var keyForDisplay = rawStreamKey is null ? "STREAM_KEY_SHOWN_ON_CREATE" : rawStreamKey;
            var maskedKey = rawStreamKey is null ? "Only shown when created, regenerate to get a new one." : MaskSecret(rawStreamKey);

            var rtmpStreamKey = $"{stream.Path}?user={Uri.EscapeDataString(stream.PublishUser)}&pass={Uri.EscapeDataString(keyForDisplay)}";
            var srtPublishUrl = rawStreamKey is null
                ? null
                : $"{_mediaMtxOptions.SrtBaseUrl}?streamid=publish:{stream.Path}:{stream.PublishUser}:{keyForDisplay}";

            return new ProjectStreamDto
            {
                Id = stream.Id,
                ProjectId = stream.ProjectId,
                Name = stream.Name,
                Path = stream.Path,
                DisplayPath = $"project-{stream.ProjectId}/{stream.Name}",
                PublishUser = stream.PublishUser,
                PublishOptions =
                [
                    new StreamProtocolOption
                    {
                        Protocol = "RTMP",
                        ServerUrl = _mediaMtxOptions.RtmpBaseUrl,
                        StreamKey = rawStreamKey is null ? maskedKey : rtmpStreamKey,
                        Note = "Recommended for OBS"
                    },
                    new StreamProtocolOption
                    {
                        Protocol = "SRT",
                        ServerUrl = srtPublishUrl,
                        StreamKey = null,
                        Note = rawStreamKey is null
                            ? "Key only shown on create — regenerate to get a new one"
                            : "Paste the full URL into OBS Server field — no separate stream key"
                    },
                ],
                PlaybackOptions =
                [
                    new StreamProtocolOption
                    {
                        Protocol = "RTSP",
                        Url = $"{_mediaMtxOptions.RtspBaseUrl}/{stream.Path}",
                        Note = "~1–3s latency, use in OBS Media Source or VLC"
                    },
                    new StreamProtocolOption
                    {
                        Protocol = "SRT",
                        Url = $"{_mediaMtxOptions.SrtBaseUrl}?streamid=read:{stream.Path}",
                        Note = "~1s latency, use in OBS Media Source or VLC"
                    },
                    new StreamProtocolOption
                    {
                        Protocol = "HLS",
                        Url = $"{_mediaMtxOptions.HlsBaseUrl}/{stream.Path}/index.m3u8",
                        Note = "~30s latency, works in any browser"
                    }
                ],
                RecordingEnabled = stream.RecordingEnabled,
                CreatedAt = stream.CreatedAt,
                HasVisibleSecret = rawStreamKey is not null,
                CanRotateKey = canRotateKey
            };
        }
    }
}
