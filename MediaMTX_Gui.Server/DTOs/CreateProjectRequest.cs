using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.DTOs
{
    public class CreateProjectRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Description { get; set; }
    }
}