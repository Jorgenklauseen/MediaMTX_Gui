using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{

    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetProjectsForCurrentUserAsync(ClaimsPrincipal principal);

        Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, ClaimsPrincipal principal);

        Task<ProjectDto?> GetProjectByIdForCurrentUserAsync(int projectId, ClaimsPrincipal principal);
        Task<bool> DeleteProjectForCurrentUserAsync(int projectId, ClaimsPrincipal principal);
        Task<bool> LeaveProjectAsync(int projectId, ClaimsPrincipal principal);
        Task<IEnumerable<ProjectMemberDto>?> GetProjectMembersAsync(int projectId, ClaimsPrincipal principal);
    }
}