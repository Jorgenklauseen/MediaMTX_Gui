using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.Models
{
    public class Recording
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? StartedAt { get; set; }

        public DateTime? EndedAt { get; set; }

        public string Status { get; set; } = "pending"; // pending, recording, completed, failed

        public string FilePath { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public TimeSpan Duration { get; set; }

        public string? ProjectName { get; set; }
        public string StreamName { get; set; } = string.Empty;

        public int? ProjectId { get; set; }

        public Guid? ProjectStreamId { get; set; }

        public int CreatedById { get; set; }
        public User? CreatedBy { get; set; }
    }
}
