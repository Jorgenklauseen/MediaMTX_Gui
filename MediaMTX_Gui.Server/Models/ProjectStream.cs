namespace MediaMTX_Gui.Server.Models
{
    public class ProjectStream
    {
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string PublishUser { get; set; } = string.Empty;
        public string StreamKeyHash { get; set; } = string.Empty;
        public bool RecordingEnabled { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Project Project { get; set; } = null!;
        public User CreatedByUser { get; set; } = null!;
    }
}
