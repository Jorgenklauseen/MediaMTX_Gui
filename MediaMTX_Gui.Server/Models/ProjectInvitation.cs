public class ProjectInvitation
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int InvitedByUserId { get; set; }
    public string InvitedEmail { get; set; }
    public string Token { get; set; }          
    public DateTime ExpiresAt { get; set; }
    public bool IsAccepted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}