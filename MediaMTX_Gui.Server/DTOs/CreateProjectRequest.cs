using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.DTOs
{
    public class CreateProjectRequest
    {
        public string Name { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Description { get; set; }
    }
}