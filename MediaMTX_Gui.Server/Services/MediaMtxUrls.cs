namespace MediaMTX_Gui.Server.Services
{
    public record MediaMtxUrls(
        string RtmpBaseUrl,
        string RtspBaseUrl,
        string HlsBaseUrl,
        string SrtBaseUrl,
        string WebRtcBaseUrl);
}
