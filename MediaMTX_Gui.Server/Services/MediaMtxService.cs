using System.Net;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace MediaMTX_Gui.Server.Services;

public class MediaMtxService : IMediaMtxService
{
    private readonly HttpClient _httpClient;

    public MediaMtxService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(configuration["MediaMtx:BaseUrl"]!);
    }

    public async Task<string> GetPathsAsync()
    {
        var response = await _httpClient.GetAsync("/v3/paths/list");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> GetPathDetailsAsync(string name)
    {
        var encodedPath = string.Join("/", name.Split('/').Select(Uri.EscapeDataString));
        var response = await _httpClient.GetAsync($"/v3/paths/get/{encodedPath}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task KickPathAsync(string path)
    {
        var encodedPath = string.Join("/", path.Split('/').Select(Uri.EscapeDataString));

        var detailResponse = await _httpClient.GetAsync($"/v3/paths/get/{encodedPath}");
        if (detailResponse.StatusCode == HttpStatusCode.NotFound) return;
        detailResponse.EnsureSuccessStatusCode();

        var json = await detailResponse.Content.ReadAsStringAsync();
        var pathInfo = JsonSerializer.Deserialize<MediaMtxPathInfo>(json);
        if (pathInfo?.Source is null) return;

        var kickUrl = pathInfo.Source.Type switch
        {
            "rtmpConn"    => $"/v3/rtmpconns/kick/{pathInfo.Source.Id}",
            "srtConn"     => $"/v3/srtconns/kick/{pathInfo.Source.Id}",
            "rtspSession" => $"/v3/rtspsessions/kick/{pathInfo.Source.Id}",
            _ => null
        };

        if (kickUrl is null) return;

        var kickResponse = await _httpClient.PostAsync(kickUrl, null);
        if (kickResponse.StatusCode != HttpStatusCode.NotFound)
            kickResponse.EnsureSuccessStatusCode();
    }

    public async Task PatchPathRecordingAsync(string path, bool record)
    {
        var encodedPath = string.Join("/", path.Split('/').Select(Uri.EscapeDataString));
        var body = JsonSerializer.Serialize(new { record });
        var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PatchAsync($"/v3/config/paths/patch/{encodedPath}", content);
        if (response.StatusCode != HttpStatusCode.NotFound)
            response.EnsureSuccessStatusCode();
    }

    private class MediaMtxPathInfo
    {
        [JsonPropertyName("source")]
        public MediaMtxSource? Source { get; set; }
    }

    private class MediaMtxSource
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "";

        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
    }
}
