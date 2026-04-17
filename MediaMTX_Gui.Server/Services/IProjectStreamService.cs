using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{
    public interface IProjectStreamService
    {
        Task<IEnumerable<ProjectStreamDto>> GetProjectStreamsForCurrentUserAsync(int projectId, ClaimsPrincipal principal);
        Task<ProjectStreamDto> CreateProjectStreamAsync(int projectId, CreateProjectStreamRequest request, ClaimsPrincipal principal);
        Task<ProjectStreamDto> RegenerateStreamKeyAsync(int projectId, Guid streamId, ClaimsPrincipal principal);
        Task DeleteStreamAsync(int projectId, Guid streamId, ClaimsPrincipal principal);
        Task<bool> ValidatePublishCredentialsAsync(MediaMtxAuthRequestDto request);
        Task<ProjectStreamDto> ToggleRecordingAsync(int projectId, Guid streamId, bool enabled, ClaimsPrincipal principal);
        Task<string> FilterStreamJsonAsync(string json, ClaimsPrincipal principal);
    }
}
