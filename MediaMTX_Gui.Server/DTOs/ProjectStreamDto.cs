namespace MediaMTX_Gui.Server.DTOs
{
    public class ProjectStreamDto
    {
        public Guid Id { get; set; }
        public int ProjectId { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public string DisplayPath { get; set; }
        public string PublishUser { get; set; }
        public string MaskedStreamKey { get; set; }
        public string ObsServerUrl { get; set; }
        public string ObsStreamKey { get; set; }
        public string ObsPlaybackUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasVisibleSecret { get; set; }
        public bool CanRotateKey { get; set; }
    }
}
