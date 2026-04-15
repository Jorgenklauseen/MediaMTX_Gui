using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace MediaMTX_Gui.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecordingsController : ControllerBase
    {
        private readonly IRecordingService _recordingService;

        public RecordingsController(IRecordingService recordingService)
        {
            _recordingService = recordingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecordings()
        {
            var recordings = await _recordingService.GetRecordingsForCurrentUserAsync(User);
            return Ok(recordings);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetRecordingById(int id)
        {
            var recording = await _recordingService.GetRecordingByIdForCurrentUserAsync(id, User);
            if (recording is null) return NotFound();
            return Ok(recording);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRecording([FromBody] CreateRecordingRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var recording = await _recordingService.CreateRecordingAsync(request, User);
            return CreatedAtAction(nameof(GetRecordingById), new { id = recording.Id }, recording);
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> UpdateRecording(int id, [FromBody] UpdateRecordingRequest request)
        {
            var recording = await _recordingService.UpdateRecordingAsync(id, request, User);
            if (recording is null) return NotFound();
            return Ok(recording);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRecording(int id)
        {
            var deleted = await _recordingService.DeleteRecordingForCurrentUserAsync(id, User);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("{id:int}/start")]
        public async Task<IActionResult> StartRecording(int id)
        {
            var started = await _recordingService.StartRecordingAsync(id, User);
            if (!started) return NotFound();
            return Ok();
        }

        [HttpPost("{id:int}/stop")]
        public async Task<IActionResult> StopRecording(int id)
        {
            var stopped = await _recordingService.StopRecordingAsync(id, User);
            if (!stopped) return NotFound();
            return Ok();
        }

        [HttpGet("{id:int}/files")]
        public async Task<IActionResult> GetRecordingFiles(int id)
        {
            var recording = await _recordingService.GetRecordingByIdForCurrentUserAsync(id, User);
            if (recording is null) return NotFound();
            if (string.IsNullOrEmpty(recording.FilePath) || !Directory.Exists(recording.FilePath))
                return NotFound(new { message = "Recording directory not found. Files may have been auto-deleted." });

            var files = GetSessionSegments(recording)
                .Select(path => new
                {
                    name = Path.GetFileName(path),
                    size = new FileInfo(path).Length,
                    url = $"/api/recordings/{id}/files/{Uri.EscapeDataString(Path.GetFileName(path))}"
                });

            return Ok(files);
        }

        [HttpGet("{id:int}/preview")]
        public async Task<IActionResult> PreviewRecording(int id)
        {
            var recording = await _recordingService.GetRecordingByIdForCurrentUserAsync(id, User);
            if (recording is null) return NotFound();
            if (string.IsNullOrEmpty(recording.FilePath) || !Directory.Exists(recording.FilePath))
                return NotFound();

            var firstSegment = GetSessionSegments(recording).FirstOrDefault();
            if (firstSegment is null || !System.IO.File.Exists(firstSegment))
                return NotFound();

            var stream = System.IO.File.OpenRead(firstSegment);
            return File(stream, "video/mp4", enableRangeProcessing: true);
        }

        private static IEnumerable<string> GetSessionSegments(DTOs.RecordingDto recording)
        {
            if (string.IsNullOrEmpty(recording.FilePath) || !Directory.Exists(recording.FilePath))
                return Enumerable.Empty<string>();

            var sessionStart = recording.StartedAt ?? recording.CreatedAt;
            var sessionEnd = recording.EndedAt ?? DateTime.UtcNow;

            return Directory.GetFiles(recording.FilePath, "*.mp4")
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

        [HttpGet("{id:int}/files/{filename}")]
        public async Task<IActionResult> DownloadFile(int id, string filename)
        {
            var recording = await _recordingService.GetRecordingByIdForCurrentUserAsync(id, User);
            if (recording is null) return NotFound();
            if (string.IsNullOrEmpty(recording.FilePath)) return NotFound();

            var filePath = Path.Combine(recording.FilePath, filename);

            // Prevent path traversal
            var resolvedDir = Path.GetFullPath(recording.FilePath);
            var resolvedFile = Path.GetFullPath(filePath);
            if (!resolvedFile.StartsWith(resolvedDir + Path.DirectorySeparatorChar))
                return BadRequest();

            if (!System.IO.File.Exists(resolvedFile))
                return NotFound(new { message = "File no longer exists. Recordings are auto-deleted after 1 day." });

            var stream = System.IO.File.OpenRead(resolvedFile);
            return File(stream, "video/mp4", filename);
        }
    }
}