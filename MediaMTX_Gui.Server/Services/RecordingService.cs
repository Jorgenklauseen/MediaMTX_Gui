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
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) return Enumerable.Empty<RecordingDto>();

            var recordings = await _context.Recordings
                .Where(r => r.CreatedById == currentUser.Id)
                .Include(r => r.Stream)
                .Include(r => r.CreatedBy)
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

            return recordings;
        }

        public async Task<RecordingDto?> GetRecordingByIdForCurrentUserAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) return null;

            var recording = await _context.Recordings
                .Where(r => r.Id == id && r.CreatedById == currentUser.Id)
                .Include(r => r.Stream)
                .Include(r => r.CreatedBy)
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

            return recording;
        }

        public async Task<RecordingDto> CreateRecordingAsync(CreateRecordingRequest request, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) throw new UnauthorizedAccessException("User not found");

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
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) return false;

            var recording = await _context.Recordings
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == currentUser.Id);

            if (recording == null) return false;

            _context.Recordings.Remove(recording);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> StartRecordingAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) return false;

            var recording = await _context.Recordings
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == currentUser.Id);

            if (recording == null) return false;

            recording.Status = "recording";
            recording.StartedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> StopRecordingAsync(int id, ClaimsPrincipal user)
        {
            var currentUser = await _userService.GetCurrentUser(user);
            if (currentUser == null) return false;

            var recording = await _context.Recordings
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == currentUser.Id);

            if (recording == null) return false;

            recording.Status = "completed";
            recording.EndedAt = DateTime.UtcNow;
            if (recording.StartedAt.HasValue)
            {
                recording.Duration = recording.EndedAt.Value - recording.StartedAt.Value;
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}