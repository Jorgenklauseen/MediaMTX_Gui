namespace MediaMTX_Gui.Server.Models
{
    public class ProjectMember
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public bool IsOwner { get; set; } = false;
        public DateTime? JoinedAt { get; set; }
        public Project Project { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
