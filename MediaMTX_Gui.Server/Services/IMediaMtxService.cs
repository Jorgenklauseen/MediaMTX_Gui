namespace MediaMTX_Gui.Server.Services;
public interface IMediaMtxService
{
    Task<string> GetPathsAsync();
    Task<string> GetPathDetailsAsync(string name);
}