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
    public async Task<IActionResult> InviteUser(int projectId, [FromBody] InviteRequest request)
    {
        await _invitationService.InviteUserAsync(projectId, request.Email, User);
        return Ok();
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptInvitation([FromBody] AcceptInvitationRequest request)
    {
        await _invitationService.AcceptInvitationAsync(request.Token, User);
        return Ok();
    }

    public record InviteRequest(string Email);
    public record AcceptInvitationRequest(string Token);
}