

using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{
    public interface IUserService
    {
        Task<UserDto> GetRequiredCurrentUserAsync(ClaimsPrincipal principal);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> SyncUserAsync(ClaimsPrincipal principal);
        Task BanUserAsync(int id);
        Task UnbanUserAsync(int id);
        Task DeleteCurrentUserAsync(ClaimsPrincipal principal);
    }
}