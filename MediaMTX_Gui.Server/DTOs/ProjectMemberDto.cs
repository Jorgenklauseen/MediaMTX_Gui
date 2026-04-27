namespace MediaMTX_Gui.Server.DTOs
{
    public class ProjectMemberDto
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public bool IsOwner { get; set; }
        public DateTime? JoinedAt { get; set; }
    }
}