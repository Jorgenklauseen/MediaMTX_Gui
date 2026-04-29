using System.Security.Claims;
using System.Text.Json;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaMTX_Gui.Server.Services
{
    public class RecordingService : IRecordingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserService _userService;

        public RecordingService(ApplicationDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        public async Task<IEnumerable<RecordingDto>> GetRecordingsForCurrentUserAsync(ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);

            IQueryable<Recording> query = _context.Recordings
                .Include(r => r.Stream)
                .Include(r => r.CreatedBy);

            if (currentUser.Role != "admin")
            {
                var ownedPaths = await GetOwnedProjectStreamPathsAsync(currentUser.Id);
                query = query.Where(r =>
                    r.CreatedById == currentUser.Id ||
                    ownedPaths.Contains(r.StreamId));
            }

            return await query
                .Select(r => new RecordingDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    StreamName = r.Stream!.Name,
                    CreatedAt = r.CreatedAt,
                    StartedAt = r.StartedAt,
                    EndedAt = r.EndedAt,
                    FilePath = r.FilePath,
                    FileSize = r.FileSize,
                    Duration = r.Duration,
                    StreamId = r.StreamId,
                    CreatedById = r.CreatedById,
                    CreatedByName = r.CreatedBy!.Username ?? string.Empty
                })
                .ToListAsync();
        }

        public async Task<RecordingDto?> GetRecordingByIdForCurrentUserAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);

            IQueryable<Recording> query = _context.Recordings
                .Where(r => r.Id == id)
                .Include(r => r.Stream)
                .Include(r => r.CreatedBy);

            if (currentUser.Role != "admin")
            {
                var ownedPaths = await GetOwnedProjectStreamPathsAsync(currentUser.Id);
                query = query.Where(r =>
                    r.CreatedById == currentUser.Id ||
                    ownedPaths.Contains(r.StreamId));
            }

            return await query
                .Select(r => new RecordingDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    StreamName = r.Stream!.Name,
                    CreatedAt = r.CreatedAt,
                    StartedAt = r.StartedAt,
                    EndedAt = r.EndedAt,
                    FilePath = r.FilePath,
                    FileSize = r.FileSize,
                    Duration = r.Duration,
                    StreamId = r.StreamId,
                    CreatedById = r.CreatedById,
                    CreatedByName = r.CreatedBy!.Username ?? string.Empty
                })
                .FirstOrDefaultAsync();
        }

        public async Task<RecordingDto> CreateRecordingAsync(CreateRecordingRequest request, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);

            var stream = await _context.Set<MediaStream>().FindAsync(request.StreamId);
            if (stream == null) throw new ArgumentException("Stream not found", nameof(request.StreamId));

            var recording = new Recording
            {
                Name = request.Name,
                Description = request.Description,
                StreamId = request.StreamId,
                CreatedById = currentUser.Id,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Recordings.Add(recording);
            await _context.SaveChangesAsync();

            return new RecordingDto
            {
                Id = recording.Id,
                Name = recording.Name,
                Description = recording.Description,
                Status = recording.Status,
                StreamName = stream.Name,
                CreatedAt = recording.CreatedAt,
                StartedAt = recording.StartedAt,
                EndedAt = recording.EndedAt,
                FilePath = recording.FilePath,
                FileSize = recording.FileSize,
                Duration = recording.Duration,
                StreamId = recording.StreamId,
                CreatedById = recording.CreatedById,
                CreatedByName = currentUser.Username ?? string.Empty
            };
        }

        public async Task<bool> DeleteRecordingForCurrentUserAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);
            var recording = await _context.Recordings.FirstOrDefaultAsync(r => r.Id == id);

            if (recording == null) return false;
            if (!await CanManageRecordingAsync(recording, currentUser)) return false;

            _context.Recordings.Remove(recording);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> StartRecordingAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);
            var recording = await _context.Recordings.FirstOrDefaultAsync(r => r.Id == id);

            if (recording == null) return false;
            if (!await CanManageRecordingAsync(recording, currentUser)) return false;

            recording.Status = "recording";
            recording.StartedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> StopRecordingAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);
            var recording = await _context.Recordings.FirstOrDefaultAsync(r => r.Id == id);

            if (recording == null) return false;
            if (!await CanManageRecordingAsync(recording, currentUser)) return false;

            recording.Status = "completed";
            recording.EndedAt = DateTime.UtcNow;
            if (recording.StartedAt.HasValue)
                recording.Duration = recording.EndedAt.Value - recording.StartedAt.Value;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<RecordingDto?> UpdateRecordingAsync(int id, UpdateRecordingRequest request, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);

            var recording = await _context.Recordings
                .Include(r => r.Stream)
                .Include(r => r.CreatedBy)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recording == null) return null;
            if (!await CanManageRecordingAsync(recording, currentUser)) return null;

            recording.Description = request.Description ?? string.Empty;
            await _context.SaveChangesAsync();

            return new RecordingDto
            {
                Id = recording.Id,
                Name = recording.Name,
                Description = recording.Description,
                Status = recording.Status,
                StreamName = recording.Stream!.Name,
                CreatedAt = recording.CreatedAt,
                StartedAt = recording.StartedAt,
                EndedAt = recording.EndedAt,
                FilePath = recording.FilePath,
                FileSize = recording.FileSize,
                Duration = recording.Duration,
                StreamId = recording.StreamId,
                CreatedById = recording.CreatedById,
                CreatedByName = recording.CreatedBy!.Username ?? string.Empty
            };
        }

        private async Task<HashSet<string>> GetOwnedProjectStreamPathsAsync(int userId)
        {
            return await _context.ProjectMembers
                .Where(pm => pm.UserId == userId && pm.IsOwner)
                .Join(_context.ProjectStreams,
                    pm => pm.ProjectId,
                    ps => ps.ProjectId,
                    (pm, ps) => ps.Path)
                .ToHashSetAsync();
        }

        private async Task<bool> CanManageRecordingAsync(Recording recording, UserDto user)
        {
            if (user.Role == "admin") return true;
            if (recording.CreatedById == user.Id) return true;

            var ownedPaths = await GetOwnedProjectStreamPathsAsync(user.Id);
            return ownedPaths.Contains(recording.StreamId);
        }

        public async Task SyncStreamsAsync(string json)
        {
            var data = JsonSerializer.Deserialize<MediaMtxPathsResponse>(json);
            if (data?.items == null) return;

            foreach (var item in data.items)
            {
                var existing = await _context.Streams.FindAsync(item.name);
                if (existing == null)
                {
                    _context.Streams.Add(new MediaStream
                    {
                        Id = item.name,
                        Name = item.name,
                        Url = item.source?.id ?? "",
                        Format = item.source?.type ?? ""
                    });
                }
                else
                {
                    existing.Name = item.name;
                    existing.Url = item.source?.id ?? "";
                    existing.Format = item.source?.type ?? "";
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task HandleStreamStartedAsync(string streamName)
        {
            var projectStream = await _context.ProjectStreams
                .FirstOrDefaultAsync(ps => ps.Path == streamName && ps.RecordingEnabled);

            if (projectStream == null) return;

            var recordingDir = Path.Combine("/recordings", streamName.Replace("/", Path.DirectorySeparatorChar.ToString()));
            _context.Recordings.Add(new Recording
            {
                Name = $"{streamName} — {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC",
                StreamId = streamName,
                CreatedById = projectStream.CreatedByUserId,
                Status = "recording",
                StartedAt = DateTime.UtcNow,
                FilePath = recordingDir
            });

            await _context.SaveChangesAsync();
        }

        public async Task HandleStreamStoppedAsync(string streamName)
        {
            var activeRecording = await _context.Recordings
                .Where(r => r.StreamId == streamName && r.Status == "recording")
                .FirstOrDefaultAsync();

            if (activeRecording == null) return;

            activeRecording.Status = "completed";
            activeRecording.EndedAt = DateTime.UtcNow;
            if (activeRecording.StartedAt.HasValue)
                activeRecording.Duration = activeRecording.EndedAt.Value - activeRecording.StartedAt.Value;

            if (!string.IsNullOrEmpty(activeRecording.FilePath) && Directory.Exists(activeRecording.FilePath))
            {
                activeRecording.FileSize = GetSessionSegmentPathsFromModel(
                        activeRecording.FilePath,
                        activeRecording.StartedAt ?? activeRecording.CreatedAt,
                        activeRecording.EndedAt ?? DateTime.UtcNow)
                    .Sum(f => new FileInfo(f).Length);
            }

            await _context.SaveChangesAsync();
        }

        public IEnumerable<string> GetSessionSegmentPaths(RecordingDto recording)
        {
            if (string.IsNullOrEmpty(recording.FilePath) || !Directory.Exists(recording.FilePath))
                return Enumerable.Empty<string>();

            return GetSessionSegmentPathsFromModel(
                recording.FilePath,
                recording.StartedAt ?? recording.CreatedAt,
                recording.EndedAt ?? DateTime.UtcNow);
        }

        private static IEnumerable<string> GetSessionSegmentPathsFromModel(
            string filePath, DateTime sessionStart, DateTime sessionEnd)
        {
            return Directory.GetFiles(filePath, "*.mp4")
                .Select(f =>
                {
                    var stem = Path.GetFileNameWithoutExtension(f);
                    DateTime.TryParseExact(
                        stem,
                        "yyyy-MM-dd_HH-mm-ss",
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.AssumeUniversal |
                        System.Globalization.DateTimeStyles.AdjustToUniversal,
                        out var segmentTime);
                    return (path: f, segmentTime);
                })
                .Where(x =>
                    x.segmentTime >= sessionStart.AddSeconds(-5) &&
                    x.segmentTime <= sessionEnd.AddSeconds(35))
                .OrderBy(x => x.segmentTime)
                .Select(x => x.path);
        }
    }
}