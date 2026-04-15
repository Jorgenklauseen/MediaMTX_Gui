using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}