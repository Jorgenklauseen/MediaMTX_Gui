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
        
        public DateTime? StartedAt { get; set; }    // Why ?

        public DateTime? EndedAt { get; set; }      // Why ?

        public string Status { get; set; } = "pending"; // pending, recording, completed, failed
        
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        public TimeSpan Duration { get; set; }
        
        // Foreign keys
        public int StreamId { get; set; }
        public MediaStream? Stream { get; set; }
        
        public int CreatedById { get; set; }
        public User? CreatedBy { get; set; }
    }
}

