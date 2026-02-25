using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace MediaMTX_Gui.Server.Configuration
{
    public static class OidcExtensions
    {
        public static IServiceCollection AddCustomOidc(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // OIDC config her:
            var oidcConfig = configuration.GetSection("OpenIDConnectSettings");

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie()

            .AddOpenIdConnect(options =>
            {            
                options.Authority = oidcConfig["Authority"];        // URL til Identity Provider
                options.ClientId = oidcConfig["ClientId"];          // Identifiserer applikasjonen hos Identity Provider
                options.ClientSecret = oidcConfig["ClientSecret"];  // Beviser at backend faktisk er client som ble registrert, når authorization codes byttes mot tokens

                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.ResponseType = OpenIdConnectResponseType.Code;

                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = true;

                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = "name",
                    RoleClaimType = "roles"
                };
            });
            return services;
        }
    }
}
