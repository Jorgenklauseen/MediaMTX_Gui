using Microsoft.EntityFrameworkCore;
using MediaMTX_Gui.Server.Data;
using MediaMTX_Gui.Server.Models;
using MediaMTX_Gui.Server.Services;
using MediaMTX_Gui.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using MediaMTX_Gui.Server.DTOs;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


builder.Services.AddHttpClient<IMediaMtxService, MediaMtxService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
    options.Authority = builder.Configuration["Oidc:Authority"];
    options.ClientId = builder.Configuration["Oidc:ClientId"];
    options.ClientSecret = builder.Configuration["Oidc:ClientSecret"];

    options.Scope.Add("email");

    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.ResponseType = OpenIdConnectResponseType.Code;

    options.SaveTokens = true;
    options.GetClaimsFromUserInfoEndpoint = true;

    options.MapInboundClaims = false;
    options.TokenValidationParameters.NameClaimType = JwtRegisteredClaimNames.Name;
    options.TokenValidationParameters.RoleClaimType = ClaimTypes.Role;

    options.Events = new OpenIdConnectEvents
    {
        
        OnAuthorizationCodeReceived = context =>
        {
            var clientId = context.Options.ClientId!;
            var clientSecret = context.Options.ClientSecret!;
            var credentials = Convert.ToBase64String(
                System.Text.Encoding.ASCII.GetBytes($"{clientId}:{clientSecret}"));

            context.TokenEndpointRequest!.ClientId = null;
            context.TokenEndpointRequest.ClientSecret = null;

            context.Backchannel.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

            return Task.CompletedTask;
        },
        OnTokenValidated = async context =>
        {
            var userService = context.HttpContext.RequestServices
                .GetRequiredService<IUserService>();

            var userDto = await userService.SyncUserAsync(context.Principal!);

            if(userDto.IsBanned)
            {
                context.Fail("User is banned");
                return;
            }

            var identity = new ClaimsIdentity();
            identity.AddClaim(new Claim(ClaimTypes.Role, userDto.Role));
            context.Principal!.AddIdentity(identity);
        },

    };
});


var app = builder.Build();

// Configure forwarded headers to work correctly behind a reverse proxy
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor
};

forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<StreamHub>("/hubs/streams");

app.MapFallbackToFile("/index.html");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();


