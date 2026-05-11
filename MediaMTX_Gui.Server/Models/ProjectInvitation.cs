namespace MediaMTX_Gui.Server.Models
{
    public class ProjectInvitation
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int InvitedByUserId { get; set; }
        public string InvitedEmail { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsAccepted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Project Project { get; set; } = null!;
        public User InvitedByUser { get; set; } = null!;
    }
}
