namespace MediaMTX_Gui.Server.Services;

using System.Security.Claims;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.Models;
using Microsoft.EntityFrameworkCore;

public class InvitationService : IInvitationService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;

    private IHttpContextAccessor _httpContextAccessor;

    public InvitationService(ApplicationDbContext db, IEmailService emailService, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
    }

    private async Task<User> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue("sub")!;
        return await _db.Users.FirstOrDefaultAsync(u => u.SubId == sub)
            ?? throw new UnauthorizedAccessException("User not found.");
    }

    public async Task InviteUserAsync(int projectId, string email, ClaimsPrincipal principal)
    {
        var currentUser = await GetCurrentUserAsync(principal);

        var isMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == currentUser.Id);

        if (!isMember)
        {
            throw new UnauthorizedAccessException("Only project members can invite users.");
        }

        var project = await _db.Projects.FindAsync(projectId);
        if (project == null)
        {
            throw new InvalidOperationException("Project not found.");
        }

        var invitedUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (invitedUser != null)
        {
            var alreadyMember = await _db.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == invitedUser.Id);
            if (alreadyMember)
            {
                throw new InvalidOperationException("User is already a member of the project.");
            }
        }
        var token = Guid.NewGuid().ToString();

        var invitation = new ProjectInvitation
        {
            ProjectId = projectId,
            InvitedByUserId = currentUser.Id,
            InvitedEmail = email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _db.ProjectInvitations.Add(invitation);
        await _db.SaveChangesAsync();

        var request = _httpContextAccessor.HttpContext!.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        var invitationLink = $"{baseUrl}/invitations/accept?token={token}";

        await _emailService.SendEmailAsync(email, project.Name, invitationLink);
    }


    public async Task AcceptInvitationAsync(string token, ClaimsPrincipal principal)
    {
        var currentUser = await GetCurrentUserAsync(principal);
        var invitation = await _db.ProjectInvitations.FirstOrDefaultAsync(i => i.Token == token && !i.IsAccepted)
            ?? throw new InvalidOperationException("Invalid or expired invitation.");

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Invitation has expired.");
        }
        
        var emailClaim = principal.FindFirstValue("email");

        if (!string.Equals(invitation.InvitedEmail, emailClaim, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("This invitation was not sent to your email.");
        }

        
        var membership = new ProjectMember
        {
            ProjectId = invitation.ProjectId,
            UserId = currentUser.Id,
            Role = "Member",
            IsOwner = false,
            JoinedAt = DateTime.UtcNow
        };

        invitation.IsAccepted = true;

        _db.ProjectMembers.Add(membership);
        await _db.SaveChangesAsync();

    }
}