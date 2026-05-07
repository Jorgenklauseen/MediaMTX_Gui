using System.ComponentModel.DataAnnotations;

namespace MediaMTX_Gui.Server.DTOs
{
    public class UpdateRecordingRequest
    {
        [MaxLength(300)]
        public string? Description { get; set; }
    }
}
