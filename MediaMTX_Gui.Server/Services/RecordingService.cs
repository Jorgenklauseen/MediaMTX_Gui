using System.Security.Claims;
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
                .Include(r => r.CreatedBy);

            if (currentUser.Role != "admin")
            {
                var ownedPaths = await GetOwnedProjectStreamPathsAsync(currentUser.Id);
                query = query.Where(r =>
                    r.CreatedById == currentUser.Id ||
                    ownedPaths.Contains(r.StreamPath));
            }

            return await query
                .Select(r => new RecordingDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    StreamName = r.StreamPath,
                    ProjectName = r.ProjectName,
                    CreatedAt = r.CreatedAt,
                    StartedAt = r.StartedAt,
                    EndedAt = r.EndedAt,
                    FilePath = r.FilePath,
                    FileSize = r.FileSize,
                    Duration = r.Duration,
                    StreamPath = r.StreamPath,
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
                .Include(r => r.CreatedBy);

            if (currentUser.Role != "admin")
            {
                var ownedPaths = await GetOwnedProjectStreamPathsAsync(currentUser.Id);
                query = query.Where(r =>
                    r.CreatedById == currentUser.Id ||
                    ownedPaths.Contains(r.StreamPath));
            }

            return await query
                .Select(r => new RecordingDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Status = r.Status,
                    StreamName = r.StreamPath,
                    ProjectName = r.ProjectName,
                    CreatedAt = r.CreatedAt,
                    StartedAt = r.StartedAt,
                    EndedAt = r.EndedAt,
                    FilePath = r.FilePath,
                    FileSize = r.FileSize,
                    Duration = r.Duration,
                    StreamPath = r.StreamPath,
                    CreatedById = r.CreatedById,
                    CreatedByName = r.CreatedBy!.Username ?? string.Empty
                })
                .FirstOrDefaultAsync();
        }

        public async Task<RecordingDto> CreateRecordingAsync(CreateRecordingRequest request, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetRequiredCurrentUserAsync(user);

            var projectStream = await _context.ProjectStreams
                .FirstOrDefaultAsync(ps => ps.Path == request.StreamPath);
            if (projectStream == null) throw new ArgumentException("Stream not found", nameof(request.StreamPath));

            var projectName = await _context.ProjectStreams
                .Where(ps => ps.Path == request.StreamPath)
                .Select(ps => ps.Project.Name)
                .FirstOrDefaultAsync();

            var recording = new Recording
            {
                Name = request.Name,
                Description = request.Description,
                StreamPath = request.StreamPath,
                CreatedById = currentUser.Id,
                ProjectName = projectName,
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
                StreamName = recording.StreamPath,
                CreatedAt = recording.CreatedAt,
                StartedAt = recording.StartedAt,
                EndedAt = recording.EndedAt,
                FilePath = recording.FilePath,
                FileSize = recording.FileSize,
                Duration = recording.Duration,
                StreamPath = recording.StreamPath,
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
                StreamName = recording.StreamPath,
                CreatedAt = recording.CreatedAt,
                StartedAt = recording.StartedAt,
                EndedAt = recording.EndedAt,
                FilePath = recording.FilePath,
                FileSize = recording.FileSize,
                Duration = recording.Duration,
                StreamPath = recording.StreamPath,
                CreatedById = recording.CreatedById,
                CreatedByName = recording.CreatedBy!.Username ?? string.Empty
            };
        }

        private async Task<HashSet<string>> GetOwnedProjectStreamPathsAsync(int userId)
        {
            return await _context.ProjectMembers
                .Where(pm => pm.UserId == userId && pm.IsOwner)
                .SelectMany(pm => pm.Project.Streams.Select(stream => stream.Path))
                .ToHashSetAsync();
        }

        private async Task<bool> CanManageRecordingAsync(Recording recording, UserDto user)
        {
            if (user.Role == "admin") return true;
            if (recording.CreatedById == user.Id) return true;

            var ownedPaths = await GetOwnedProjectStreamPathsAsync(user.Id);
            return ownedPaths.Contains(recording.StreamPath);
        }

        public async Task HandleStreamStartedAsync(string streamName)
        {
            var projectStream = await _context.ProjectStreams
                .Include(ps => ps.Project)
                .FirstOrDefaultAsync(ps => ps.Path == streamName && ps.RecordingEnabled);

            if (projectStream == null) return;

            var recordingDir = Path.Combine("/recordings", streamName.Replace("/", Path.DirectorySeparatorChar.ToString()));
            _context.Recordings.Add(new Recording
            {
                Name = $"{streamName} — {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC",
                StreamPath = streamName,
                CreatedById = projectStream.CreatedByUserId,
                ProjectName = projectStream.Project?.Name,
                Status = "recording",
                StartedAt = DateTime.UtcNow,
                FilePath = recordingDir
            });

            await _context.SaveChangesAsync();
        }

        public async Task HandleStreamStoppedAsync(string streamName)
        {
            var activeRecording = await _context.Recordings
                .Where(r => r.StreamPath == streamName && r.Status == "recording")
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
