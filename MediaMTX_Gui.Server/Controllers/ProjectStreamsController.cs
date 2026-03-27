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
        private readonly IConfiguration _configuration;

        public ProjectStreamsController(IProjectStreamService projectStreamService, IConfiguration configuration)
        {
            _projectStreamService = projectStreamService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetStreams(int projectId)
        {
            try
            {
                var streams = await _projectStreamService.GetProjectStreamsForCurrentUserAsync(
                    projectId,
                    User,
                    ResolvePublishBaseUrl());

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
                    User,
                    ResolvePublishBaseUrl());

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

        [HttpPost("{streamId:guid}/regenerate-key")]
        public async Task<IActionResult> RegenerateKey(int projectId, Guid streamId)
        {
            try
            {
                var stream = await _projectStreamService.RegenerateStreamKeyAsync(
                    projectId,
                    streamId,
                    User,
                    ResolvePublishBaseUrl());

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

        private string ResolvePublishBaseUrl()
        {
            var configuredUrl = _configuration["MediaMtx:PublishBaseUrl"];

            if (!string.IsNullOrWhiteSpace(configuredUrl))
            {
                return configuredUrl.TrimEnd('/');
            }

            var host = Request.Host.Host;
            var port = _configuration.GetValue<int?>("MediaMtx:PublishPort") ?? 1936;

            return $"rtmp://{host}:{port}";
        }
    }
}
