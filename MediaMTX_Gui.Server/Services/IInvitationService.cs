namespace MediaMTX_Gui.Server.Services;

using System.Security.Claims;
public interface IInvitationService
{
    Task InviteUserAsync(int projectId, string email, ClaimsPrincipal principal);
    Task AcceptInvitationAsync(string token, ClaimsPrincipal principal);
}