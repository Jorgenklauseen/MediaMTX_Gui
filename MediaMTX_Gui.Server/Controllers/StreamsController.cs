using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/streams")]
public class StreamsController : ControllerBase
{
    private readonly MediaMtxService _mediaService;

    public StreamsController(MediaMtxService mediaService)
    {
        _mediaService = mediaService;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var result = await _mediaService.GetPathsAsync();
        return Ok(result);
    }
}