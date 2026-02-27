using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;

namespace MediaMTX_Gui.Server.Hubs;

public class StreamHub : Hub
{
    private readonly IMediaMtxService _mediaService;
    public StreamHub(IMediaMtxService mediaService)
    {
        _mediaService = mediaService;
    }

    public override async Task OnConnectedAsync()
    {
        var data = await _mediaService.GetPathsAsync();
        await Clients.Caller.SendAsync("StreamsUpdated", data);
    }
}

