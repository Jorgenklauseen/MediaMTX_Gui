namespace MediaMTX_Gui.Server.DTOs
{
    public class ProjectMemberDto
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; }
        public bool IsOwner { get; set; } = false;
        public DateTime? JoinedAt { get; set; }
    }
}