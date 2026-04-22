namespace MediaMTX_Gui.Server.Services;
public interface IMediaMtxService
{
    Task<string> GetPathsAsync();
    Task<string> GetPathDetailsAsync(string name);
    Task KickPathAsync(string path);
    Task PatchPathRecordingAsync(string path, bool record);
}