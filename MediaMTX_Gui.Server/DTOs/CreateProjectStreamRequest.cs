using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.DTOs
{
    public class CreateProjectStreamRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 1)]
        [RegularExpression(@"^[a-zA-Z0-9 \-_]+$", ErrorMessage = "Stream name can only contain letters (a-z), digits, spaces, hyphens and underscores.")]
        public string Name { get; set; }
    }
}
