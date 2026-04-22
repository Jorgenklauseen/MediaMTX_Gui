using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;

namespace MediaMTX_Gui.Server.Hubs;

public class StreamHub : Hub
{
    private readonly IMediaMtxService _mediaService;
    private readonly IRecordingService _recordingService;

    public StreamHub(IMediaMtxService mediaService, IRecordingService recordingService)
    {
        _mediaService = mediaService;
        _recordingService = recordingService;
    }

    public override async Task OnConnectedAsync()
    {
        var json = await _mediaService.GetPathsAsync();
        await _recordingService.SyncStreamsAsync(json);
        await Clients.Caller.SendAsync("StreamsUpdated", json);
    }
}
