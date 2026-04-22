namespace MediaMTX_Gui.Server.DTOs;

public class MediaMtxPathItem
{
    public string name { get; set; } = "";
    public MediaMtxSource? source { get; set; }
}

public class MediaMtxSource
{
    public string type { get; set; } = "";
    public string id { get; set; } = "";
}

public class MediaMtxPathsResponse
{
    public List<MediaMtxPathItem> items { get; set; } = new();
}
