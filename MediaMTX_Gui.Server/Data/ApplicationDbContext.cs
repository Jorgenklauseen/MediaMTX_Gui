using Microsoft.EntityFrameworkCore;
using MediaMTX_Gui.Server.Models;

namespace MediaMTX_Gui.Server.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext>options) : DbContext(options)
    {
        public DbSet<MediaStream> Streams => Set<MediaStream>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
        public DbSet<Recording> Recordings => Set<Recording>();
        // Configure composite primary key for Project memberships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProjectMember>()
                .HasKey(pm => new { pm.ProjectId, pm.UserId });
        }
    }
}
