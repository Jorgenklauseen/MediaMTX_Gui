namespace MediaMTX_Gui.Server.Models
{
    public class ProjectStream
    {
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public string PublishUser { get; set; }
        public string StreamKeyHash { get; set; }
        public bool RecordingEnabled { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Project Project { get; set; }
    }
}
