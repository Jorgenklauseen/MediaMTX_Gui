using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Models;

namespace MediaMTX_Gui.Server.Services
{
    public interface IRecordingService
    {
        Task<IEnumerable<RecordingDto>> GetRecordingsForCurrentUserAsync(ClaimsPrincipal user);
        Task<RecordingDto?> GetRecordingByIdForCurrentUserAsync(int id, ClaimsPrincipal user);
        Task<RecordingDto> CreateRecordingAsync(CreateRecordingRequest request, ClaimsPrincipal user);
        Task<bool> DeleteRecordingForCurrentUserAsync(int id, ClaimsPrincipal user);
        Task<bool> StartRecordingAsync(int id, ClaimsPrincipal user);
        Task<bool> StopRecordingAsync(int id, ClaimsPrincipal user);
    }
}