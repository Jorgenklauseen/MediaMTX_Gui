namespace MediaMTX_Gui.Server.DTOs
{
    public class StreamProtocolOption
    {
        public string Protocol { get; set; }
        public string? ServerUrl { get; set; }  // publish: OBS server field
        public string? StreamKey { get; set; }  // publish: OBS stream key field
        public string? Url { get; set; }         // playback: full URL
        public string Note { get; set; }
    }
}
