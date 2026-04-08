using Microsoft.AspNetCore.Mvc;
using MediaMTX_Gui.Server.Services;
using Microsoft.AspNetCore.Authorization;


namespace MediaMTX_Gui.Server.Controllers;


[ApiController]
[Authorize]
[Route("api/[controller]")]
public class InvitationController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpPost("{projectId:int}/invite")]
    public async Task<IActionResult> InviteUser([FromQuery] int projectId, [FromQuery] string email)
    {
        await _invitationService.InviteUserAsync(projectId, email, User);
        return Ok();
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptInvitation([FromQuery] string token)
    {
        await _invitationService.AcceptInvitationAsync(token, User);
        return Ok();
    }
}