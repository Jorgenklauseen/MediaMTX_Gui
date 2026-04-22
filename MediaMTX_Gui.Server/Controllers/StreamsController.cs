using Microsoft.AspNetCore.Mvc;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;
using System.Text.Json;
using MediaMTX_Gui.Server.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace MediaMTX_Gui.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamsController : ControllerBase
{
    private readonly IMediaMtxService _mediaService;
    private readonly IHubContext<StreamHub> _hubContext;
    private readonly IProjectStreamService _projectStreamService;
    private readonly IRecordingService _recordingService;
    private readonly ILogger<StreamsController> _logger;

    public StreamsController(
        IMediaMtxService mediaService,
        IHubContext<StreamHub> hubContext,
        IProjectStreamService projectStreamService,
        IRecordingService recordingService,
        ILogger<StreamsController> logger)
    {
        _mediaService = mediaService;
        _hubContext = hubContext;
        _projectStreamService = projectStreamService;
        _recordingService = recordingService;
        _logger = logger;
    }

    [HttpGet("status")]
    [Authorize]
    public async Task<IActionResult> GetStatus()
    {
        var json = await _mediaService.GetPathsAsync();
        await _recordingService.SyncStreamsAsync(json);

        var filteredJson = await _projectStreamService.FilterStreamJsonAsync(json, User);
        return Content(filteredJson, "application/json");
    }

    [HttpPost("started")]
    public async Task<IActionResult> StreamStarted([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await _recordingService.SyncStreamsAsync(json);
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        await _recordingService.HandleStreamStartedAsync(name);
        return Ok();
    }

    [HttpPost("stopped")]
    public async Task<IActionResult> StreamStopped([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await _recordingService.SyncStreamsAsync(json);
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        await _recordingService.HandleStreamStoppedAsync(name);
        return Ok();
    }

    [HttpPost("reader-started")]
    public async Task<IActionResult> ReaderStarted()
    {
        var json = await _mediaService.GetPathsAsync();
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        return Ok();
    }

    [HttpPost("reader-stopped")]
    public async Task<IActionResult> ReaderStopped()
    {
        var json = await _mediaService.GetPathsAsync();
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        return Ok();
    }

    [AllowAnonymous]
    [HttpGet("view")]
    public async Task<IActionResult> GetPublicStreamStatus([FromQuery] string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return BadRequest();

        var exists = await _projectStreamService.PublicStreamExistsAsync(path);
        if (!exists)
            return NotFound();

        try
        {
            var json = await _mediaService.GetPathDetailsAsync(path);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var ready = root.TryGetProperty("ready", out var readyProp) && readyProp.GetBoolean();
            var onlineTime = root.TryGetProperty("readyTime", out var timeProp) ? timeProp.GetString() : null;
            var readerCount = root.TryGetProperty("readers", out var readersProp)
                ? readersProp.GetArrayLength()
                : 0;

            return Ok(new { online = ready, onlineTime, readerCount });
        }
        catch
        {
            return Ok(new { online = false, onlineTime = (string?)null, readerCount = 0 });
        }
    }

    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<IActionResult> Authenticate([FromBody] MediaMtxAuthRequestDto request)
    {
        _logger.LogInformation(
            "MediaMTX auth request: Path={Path}, Action={Action}, Protocol={Protocol}, User={User}, PasswordPresent={PasswordPresent}, Query={Query}",
            request.Path, request.Action, request.Protocol, request.User,
            !string.IsNullOrWhiteSpace(request.Password), request.Query);

        var isAllowed = await _projectStreamService.ValidatePublishCredentialsAsync(request);
        return isAllowed ? Ok() : Unauthorized();
    }
}
