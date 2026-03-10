using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authentication.Cookies;


namespace MediaMTX_Gui.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var name = User.FindFirst("name")?.Value;
        var username = User.FindFirst("preferred_username")?.Value;
        var email = User.FindFirst("email")?.Value;
        var sub = User.FindFirst("sub")?.Value;

        return Ok(new { name, username, email, sub });
    }

    [HttpGet("login")]
    public IActionResult Login(string returnUrl = "/")
    {
        return Challenge(new Microsoft.AspNetCore.Authentication.AuthenticationProperties
        {
            RedirectUri = returnUrl
        });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        return SignOut();
    }
}