using System.Net;

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
        var response = await _httpClient.GetAsync($"/v3/paths/get/{Uri.EscapeDataString(name)}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task KickPathAsync(string path)
    {
        var response = await _httpClient.PostAsync($"/v3/paths/kick/{Uri.EscapeDataString(path)}", null);
        if (response.StatusCode != HttpStatusCode.NotFound)
            response.EnsureSuccessStatusCode();
    }
}
