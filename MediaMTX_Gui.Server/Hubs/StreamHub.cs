using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.Models;
using System.Text.Json;

namespace MediaMTX_Gui.Server.Hubs;

public class StreamHub : Hub
{
    private readonly IMediaMtxService _mediaService;
    private readonly ApplicationDbContext _context;

    public StreamHub(IMediaMtxService mediaService, ApplicationDbContext context)
    {
        _mediaService = mediaService;
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

    public override async Task OnConnectedAsync()
    {
        var data = await _mediaService.GetPathsAsync();
        await SyncStreams(data);
        await Clients.Caller.SendAsync("StreamsUpdated", data);
    }
}

