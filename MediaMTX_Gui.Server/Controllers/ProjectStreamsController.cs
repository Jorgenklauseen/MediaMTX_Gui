using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediaMTX_Gui.Server.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId:int}/streams")]
    [Authorize]
    public class ProjectStreamsController : ControllerBase
    {
        private readonly IProjectStreamService _projectStreamService;

        public ProjectStreamsController(IProjectStreamService projectStreamService)
        {
            _projectStreamService = projectStreamService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStreams(int projectId)
        {
            try
            {
                var streams = await _projectStreamService.GetProjectStreamsForCurrentUserAsync(
                    projectId,
                    User);

                return Ok(streams);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateStream(int projectId, [FromBody] CreateProjectStreamRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var stream = await _projectStreamService.CreateProjectStreamAsync(
                    projectId,
                    request,
                    User);

                return Ok(stream);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(new { message = exception.Message });
            }
        }

        [HttpDelete("{streamId:guid}")]
        public async Task<IActionResult> DeleteStream(int projectId, Guid streamId)
        {
            try
            {
                await _projectStreamService.DeleteStreamAsync(projectId, streamId, User);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("{streamId:guid}/regenerate-key")]
        public async Task<IActionResult> RegenerateKey(int projectId, Guid streamId)
        {
            try
            {
                var stream = await _projectStreamService.RegenerateStreamKeyAsync(
                    projectId,
                    streamId,
                    User);

                return Ok(stream);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

    }
}
