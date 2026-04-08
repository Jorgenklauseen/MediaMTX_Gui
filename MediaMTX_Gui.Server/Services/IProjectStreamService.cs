using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{
    public interface IProjectStreamService
    {
        Task<IEnumerable<ProjectStreamDto>> GetProjectStreamsForCurrentUserAsync(int projectId, ClaimsPrincipal principal, MediaMtxUrls urls);
        Task<ProjectStreamDto> CreateProjectStreamAsync(int projectId, CreateProjectStreamRequest request, ClaimsPrincipal principal, MediaMtxUrls urls);
        Task<ProjectStreamDto> RegenerateStreamKeyAsync(int projectId, Guid streamId, ClaimsPrincipal principal, MediaMtxUrls urls);
        Task<bool> ValidatePublishCredentialsAsync(MediaMtxAuthRequestDto request);
    }
}
