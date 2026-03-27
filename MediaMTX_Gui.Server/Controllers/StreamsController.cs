using Microsoft.AspNetCore.Mvc;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;
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

    // temporary logger
    private readonly ILogger<StreamsController> _logger;
    
    public StreamsController(
        IMediaMtxService mediaService,
        IHubContext<StreamHub> hubContext,
        IProjectStreamService projectStreamService,
        ILogger<StreamsController> logger
        )
    {
        _mediaService = mediaService;
        _hubContext = hubContext;
        _projectStreamService = projectStreamService;
        _logger = logger;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var result = await _mediaService.GetPathsAsync();
        return Ok(result);
    }

    [HttpPost("started")]
    public async Task<IActionResult> StreamStarted([FromQuery] string name)
    {
        var all = await _mediaService.GetPathsAsync();
        Console.WriteLine($"Sending StreamsUpdated to all clients for stream: {name}");
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", all);
        return Ok();
    }

    [HttpPost("stopped")]
    public async Task<IActionResult> StreamStopped([FromQuery] string name)
    {
        var all = await _mediaService.GetPathsAsync();
        Console.WriteLine($"Sending StreamsUpdated to all clients for stream: {name}");
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", all);
        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<IActionResult> Authenticate([FromBody] MediaMtxAuthRequestDto request)
    {
        _logger.LogInformation("MediaMTX auth request: Path={Path}, Action={Action}, Protocol={Protocol}, User={User}, PasswordPresent={PasswordPresent}, Query={Query}",
            request.Path, request.Action, request.Protocol, request.User, !string.IsNullOrWhiteSpace(request.Password), request.Query);
            
        var isAllowed = await _projectStreamService.ValidatePublishCredentialsAsync(request);
        return isAllowed ? Ok() : Unauthorized();
    }

}
