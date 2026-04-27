using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{
    // Handles project operations: creation and retrieval of projects for the current user.
    public interface IProjectService
    {
        // Returns a list of projects that the current user is a member of.
        Task<IEnumerable<ProjectDto>> GetProjectsForCurrentUserAsync(ClaimsPrincipal principal);

        // Creates a new project and adds the current user as the owner.
        Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, ClaimsPrincipal principal);
        // Retrieves a specific project by ID if the current user is a member, otherwise returns null.
        Task<ProjectDto?> GetProjectByIdForCurrentUserAsync(int projectId, ClaimsPrincipal principal);
        Task<bool> DeleteProjectForCurrentUserAsync(int projectId, ClaimsPrincipal principal);
        Task<bool> LeaveProjectAsync(int projectId, ClaimsPrincipal principal);
        Task<IEnumerable<ProjectMemberDto>?> GetProjectMembersAsync(int projectId, ClaimsPrincipal principal);
    }
}