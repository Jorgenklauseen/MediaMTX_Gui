namespace MediaMTX_Gui.Server.DTOs
{
    public class MediaMtxAuthRequestDto
    {
        public string User { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string Ip { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Protocol { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string Query { get; set; } = string.Empty;
    }
}
