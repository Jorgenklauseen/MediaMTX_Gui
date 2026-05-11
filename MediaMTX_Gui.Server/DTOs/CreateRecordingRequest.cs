using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.DTOs
{
    public class CreateRecordingRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string Description { get; set; } = string.Empty;

        public Guid ProjectStreamId { get; set; }
    }
}
