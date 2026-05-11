using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MediaMTX_Gui.Server.Models;

namespace MediaMTX_Gui.Server.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext>options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
        public DbSet<Recording> Recordings => Set<Recording>();
        public DbSet<ProjectStream> ProjectStreams => Set<ProjectStream>();

        public DbSet<ProjectInvitation> ProjectInvitations => Set<ProjectInvitation>();


        // Ensure all DateTime properties are stored as UTC in the database
        private class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>
        (
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
        }

        // Configure composite primary key for Project memberships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProjectMember>()
                .HasKey(pm => new { pm.ProjectId, pm.UserId });

            modelBuilder.Entity<ProjectMember>()
                .HasOne(pm => pm.Project)
                .WithMany(project => project.Members)
                .HasForeignKey(pm => pm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectMember>()
                .HasOne(pm => pm.User)
                .WithMany()
                .HasForeignKey(pm => pm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne(project => project.CreatedByUser)
                .WithMany()
                .HasForeignKey(project => project.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectStream>()
                .HasIndex(stream => stream.Path)
                .IsUnique();

            modelBuilder.Entity<ProjectStream>()
                .HasOne(stream => stream.Project)
                .WithMany(project => project.Streams)
                .HasForeignKey(stream => stream.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectStream>()
                .HasOne(stream => stream.CreatedByUser)
                .WithMany()
                .HasForeignKey(stream => stream.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectInvitation>()
                .HasOne(invitation => invitation.Project)
                .WithMany()
                .HasForeignKey(invitation => invitation.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectInvitation>()
                .HasOne(invitation => invitation.InvitedByUser)
                .WithMany()
                .HasForeignKey(invitation => invitation.InvitedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Recording>()
                .HasOne(recording => recording.CreatedBy)
                .WithMany()
                .HasForeignKey(recording => recording.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Recording>()
                .HasOne<ProjectStream>()
                .WithMany()
                .HasForeignKey(recording => recording.ProjectStreamId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Recording>()
                .HasOne<Project>()
                .WithMany()
                .HasForeignKey(recording => recording.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
