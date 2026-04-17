using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using MediaMTX_Gui.Server.Services;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.Models;
using System.Text.Json;
using MediaMTX_Gui.Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
namespace MediaMTX_Gui.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamsController : ControllerBase
{
    private readonly IMediaMtxService _mediaService;
    private readonly IHubContext<StreamHub> _hubContext;
    private readonly ApplicationDbContext _context;
    private readonly IProjectStreamService _projectStreamService;
    private readonly ILogger<StreamsController> _logger;

    public StreamsController(
        IMediaMtxService mediaService,
        IHubContext<StreamHub> hubContext,
        ApplicationDbContext context,
        IProjectStreamService projectStreamService,
        ILogger<StreamsController> logger)
    {
        _mediaService = mediaService;
        _hubContext = hubContext;
        _context = context;
        _projectStreamService = projectStreamService;
        _logger = logger;
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
    [Authorize]
    public async Task<IActionResult> GetStatus()
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);

        var filteredJson = await _projectStreamService.FilterStreamJsonAsync(json, User);
        return Content(filteredJson, "application/json");
    }

    [HttpPost("started")]
    public async Task<IActionResult> StreamStarted([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);

        // Auto-create a recording entry if this stream has recording enabled
        var projectStream = await _context.ProjectStreams
            .FirstOrDefaultAsync(ps => ps.Path == name && ps.RecordingEnabled);

        if (projectStream != null)
        {
            var recordingDir = Path.Combine("/recordings", name.Replace("/", Path.DirectorySeparatorChar.ToString()));
            _context.Recordings.Add(new Recording
            {
                Name = $"{name} \u2014 {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC",
                StreamId = name,
                CreatedById = projectStream.CreatedByUserId,
                Status = "recording",
                StartedAt = DateTime.UtcNow,
                FilePath = recordingDir
            });
            await _context.SaveChangesAsync();
        }

        return Ok();
    }

    [HttpPost("stopped")]
    public async Task<IActionResult> StreamStopped([FromQuery] string name)
    {
        var json = await _mediaService.GetPathsAsync();
        await SyncStreams(json);
        await _hubContext.Clients.All.SendAsync("StreamsUpdated", json);

        // Complete any active recording for this stream
        var activeRecording = await _context.Recordings
            .Where(r => r.StreamId == name && r.Status == "recording")
            .FirstOrDefaultAsync();;

        if (activeRecording != null)
        {
            activeRecording.Status = "completed";
            activeRecording.EndedAt = DateTime.UtcNow;
            if (activeRecording.StartedAt.HasValue)
            {
                activeRecording.Duration = activeRecording.EndedAt.Value - activeRecording.StartedAt.Value;
            }

            // Sum file sizes only for segments written during this session
            if (!string.IsNullOrEmpty(activeRecording.FilePath) && Directory.Exists(activeRecording.FilePath))
            {
                var sessionStart = activeRecording.StartedAt ?? activeRecording.CreatedAt;
                var sessionEnd = activeRecording.EndedAt ?? DateTime.UtcNow;

                activeRecording.FileSize = Directory.GetFiles(activeRecording.FilePath, "*.mp4")
                    .Where(f =>
                    {
                        var stem = Path.GetFileNameWithoutExtension(f);
                        if (!DateTime.TryParseExact(
                            stem,
                            "yyyy-MM-dd_HH-mm-ss",
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.AssumeUniversal |
                            System.Globalization.DateTimeStyles.AdjustToUniversal,
                            out var segmentTime))
                            return false;
                        return segmentTime >= sessionStart.AddSeconds(-5) &&
                               segmentTime <= sessionEnd.AddSeconds(35);
                    })
                    .Sum(f => new FileInfo(f).Length);
            }

            await _context.SaveChangesAsync();
        }

        return Ok();
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
//Force typ
