

using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;

namespace MediaMTX_Gui.Server.Services
{
    public interface IUserService
    {
        UserDto GetCurrentUser(ClaimsPrincipal principal);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();

        Task<UserDto> SyncUserAsync(ClaimsPrincipal principal);
    }
}