using System.Security.Claims;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaMTX_Gui.Server.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _db;

        public ProjectService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsForCurrentUserAsync(ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            return await _db.ProjectMembers
                .Where(pm => pm.UserId == user.Id)
                .Join(
                    _db.Projects,
                    membership => membership.ProjectId,
                    project => project.Id,
                    (membership, project) => new ProjectDto
                    {
                        Id = project.Id,
                        Name = project.Name,
                        Description = project.Description,
                        Role = membership.Role,
                        CreatedByUserId = project.CreatedByUserId,
                        CreatedAt = project.CreatedAt,
                        UpdatedAt = project.UpdatedAt
                    })
                .ToListAsync();
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            // Use a transaction to ensure both project creation and membership assignment succeed together
            await using var transaction = await _db.Database.BeginTransactionAsync();

            var project = new Project
            {
                Name = request.Name,
                Description = request.Description ?? string.Empty,
                CreatedByUserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            var membership = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = user.Id,
                Role = "Owner",
                IsOwner = true,
                JoinedAt = DateTime.UtcNow
            };

            _db.ProjectMembers.Add(membership);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToProjectDto(project, membership.Role);
        }

        public async Task<ProjectDto?> GetProjectByIdForCurrentUserAsync(int projectId, ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            var project = await _db.ProjectMembers
                .Where(pm => pm.ProjectId == projectId && pm.UserId == user.Id)
                .Join(
                    _db.Projects,
                    membership => membership.ProjectId,
                    project => project.Id,
                    (membership, project) => new ProjectDto
                    {
                        Id = project.Id,
                        Name = project.Name,
                        Description = project.Description,
                        Role = membership.Role,
                        CreatedByUserId = project.CreatedByUserId,
                        CreatedAt = project.CreatedAt,
                        UpdatedAt = project.UpdatedAt
                    })
                .FirstOrDefaultAsync();

            return project;
        }


        private async Task<User> GetCurrentPersistedUserAsync(ClaimsPrincipal principal)
        {
            var sub = principal.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(sub))
            {
                throw new UnauthorizedAccessException("Missing subject claim.");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.SubId == sub);

            if (user is null)
            {
                throw new UnauthorizedAccessException("Authenticated user was not found in the database.");
            }

            return user;
        }

        public async Task<bool> DeleteProjectForCurrentUserAsync(int projectId, ClaimsPrincipal principal)
        {
            var user = await GetCurrentPersistedUserAsync(principal);

            var membership = await _db.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);

            if (membership is null || !membership.IsOwner)
            {
                return false;
            }

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId);

            if (project is null)
            {
                return false;
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();

            var memberships = await _db.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .ToListAsync();

            _db.ProjectMembers.RemoveRange(memberships);
            _db.Projects.Remove(project);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }


        private static ProjectDto MapToProjectDto(Project project, string role) => new()
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Role = role,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        };
    }
}
