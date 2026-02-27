using Microsoft.AspNetCore.Mvc;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;

namespace MediaMTX_Gui.Server.Controllers;
[ApiController]
[Route("api/[controller]")]
public class StreamsController : ControllerBase
{
    private readonly IMediaMtxService _mediaService;
    private readonly IHubContext<StreamHub> _hubContext;

    public StreamsController(IMediaMtxService mediaService, IHubContext<StreamHub> hubContext)
    {
        _mediaService = mediaService;
        _hubContext = hubContext;
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

}