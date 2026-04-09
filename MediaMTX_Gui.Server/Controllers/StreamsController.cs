using Microsoft.AspNetCore.Mvc;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.Models;
using System.Text.Json;

namespace MediaMTX_Gui.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamsController : ControllerBase
{
    private readonly IMediaMtxService _mediaService;
    private readonly IHubContext<StreamHub> _hubContext;
    private readonly ApplicationDbContext _context;

    public StreamsController(IMediaMtxService mediaService, IHubContext<StreamHub> hubContext, ApplicationDbContext context)
    {
        _mediaService = mediaService;
        _hubContext = hubContext;
        _context = context;
    }

    public class MediaMtxPathItem
    {
        public string name { get; set; } = "";
        public MediaMtxSource? source { get; set; }
    }

    public class MediaMtxSource
    {
        public string type { get; set; } = "";
        public string id { get; set; } = "";
    }

    public class MediaMtxPathsResponse
    {
        public List<MediaMtxPathItem> items { get; set; } = new();
    }

    private async Task SyncStreams(string json)
    {
        var data = JsonSerializer.Deserialize<MediaMtxPathsResponse>(json);
        if (data?.items != null)
        {
            foreach (var item in data.items)
            {
                var existing = await _context.Streams.FindAsync(item.name);
                if (existing == null)
                {
                    _context.Streams.Add(new MediaStream
                    {
                        Id = item.name,
                        Name = item.name,
                        Url = item.source?.id ?? "",
                        Format = item.source?.type ?? ""
                    });
                }
                else
                {
                    existing.Name = item.name;
                    existing.Url = item.source?.id ?? "";
                    existing.Format = item.source?.type ?? "";
                }
            }
            await _context.SaveChangesAsync();
        }
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);
        return Ok(json);
    }

    [HttpPost("started")]
    public async Task<IActionResult> StreamStarted([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);
        Console.WriteLine($"Sending StreamsUpdated to all clients for stream: {name}");
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        return Ok();
    }

    [HttpPost("stopped")]
    public async Task<IActionResult> StreamStopped([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);
        Console.WriteLine($"Sending StreamsUpdated to all clients for stream: {name}");
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);
        return Ok();
    }

}