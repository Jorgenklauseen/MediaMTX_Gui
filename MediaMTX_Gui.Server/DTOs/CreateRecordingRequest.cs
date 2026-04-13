namespace MediaMTX_Gui.Server.DTOs
{
    public class CreateRecordingRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string StreamId { get; set; } = string.Empty;
    }
}