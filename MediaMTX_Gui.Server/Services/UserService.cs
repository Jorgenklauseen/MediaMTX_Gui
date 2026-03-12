using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaMTX_Gui.Server.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;

        public UserService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<UserDto> GetCurrentUser(ClaimsPrincipal principal)
        {
            var sub = principal.FindFirstValue("sub")!;
            var user = await _db.Users.FirstOrDefaultAsync(u => u.SubId == sub);
            return MapToUserDto(user!);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            return await _db.Users.Select(u => MapToUserDto(u)).ToListAsync();
        }

        public async Task<UserDto> SyncUserAsync(ClaimsPrincipal principal)
        {
            var sub = principal.FindFirstValue("sub")!;
            var user = await _db.Users.FirstOrDefaultAsync(u => u.SubId == sub);
            if (user == null)
            {
                user = ClaimsToUser(principal);
                _db.Users.Add(user);
            }
            else
            {
                user.Name = principal.FindFirstValue("name");
                user.Email = principal.FindFirstValue("email");
                user.LastLogin = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
            return MapToUserDto(user);
        }

        public async Task BanUserAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user != null)
            {
                user.IsBanned = true;
                await _db.SaveChangesAsync();
            }
        }

        public async Task UnbanUserAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user != null)
            {
                user.IsBanned = false;
                await _db.SaveChangesAsync();
            }
        }
        


        private static User ClaimsToUser(ClaimsPrincipal principal) => new()
        {
            SubId = principal.FindFirstValue("sub"),
            Name = principal.FindFirstValue("name"),
            Username = principal.FindFirstValue("preferred_username"),
            Email = principal.FindFirstValue("email"),
        };
        private static UserDto MapToUserDto(User user) => new()
        {
            Id = user.Id,
            Name = user.Name,
            Username = user.Username,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin,
            IsBanned = user.IsBanned,
            Role = user.Role
        };
    }
}