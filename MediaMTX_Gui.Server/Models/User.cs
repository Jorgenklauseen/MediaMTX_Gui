using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.Models
{
    public class User
    {   
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? SubId { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
 
    }
}