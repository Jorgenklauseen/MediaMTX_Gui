public class MediaMtxService : IMediaMtxService
{
    private readonly HttpClient _httpClient;

    public MediaMtxService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("http://localhost:9997");
    }
    
    public async Task<string> GetPathsAsync()
    {
        var response = await _httpClient.GetAsync("/v3/paths/list");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}