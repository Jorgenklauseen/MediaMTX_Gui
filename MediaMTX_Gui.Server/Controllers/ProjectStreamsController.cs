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
                    ResolveUrls());

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
                    ResolveUrls());

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
                    ResolveUrls());

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

        private MediaMtxUrls ResolveUrls()
        {
            var host = Request.Host.Host;
            return new MediaMtxUrls(
                RtmpBaseUrl:   ResolveUrl("MediaMtx:RtmpBaseUrl",   "rtmp", host, 1936),
                RtspBaseUrl:   ResolveUrl("MediaMtx:RtspBaseUrl",   "rtsp", host, 8554),
                HlsBaseUrl:    ResolveUrl("MediaMtx:HlsBaseUrl",    "http", host, 8888),
                SrtBaseUrl:    ResolveUrl("MediaMtx:SrtBaseUrl",    "srt",  host, 8890),
                WebRtcBaseUrl: ResolveUrl("MediaMtx:WebRtcBaseUrl", "http", host, 8889)
            );
        }

        private string ResolveUrl(string configKey, string scheme, string host, int defaultPort)
        {
            var configured = _configuration[configKey];
            if (!string.IsNullOrWhiteSpace(configured))
            {
                return configured.TrimEnd('/');
            }

            var port = _configuration.GetValue<int?>(configKey + "Port") ?? defaultPort;
            return $"{scheme}://{host}:{port}";
        }
    }
}
