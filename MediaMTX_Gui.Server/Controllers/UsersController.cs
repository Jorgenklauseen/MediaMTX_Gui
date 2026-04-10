using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authentication.Cookies;
using MediaMTX_Gui.Server.Services;
using MediaMTX_Gui.Server.DTOs;
using Microsoft.AspNetCore.Authentication;



namespace MediaMTX_Gui.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{

    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }


    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var users = await _userService.GetCurrentUser(User);
        return Ok(users);
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost("{id}/ban")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> BanUser(int id)
    {
        await _userService.BanUserAsync(id);
        return Ok();
    }

    [HttpPost("{id}/unban")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UnbanUser(int id)
    {
        await _userService.UnbanUserAsync(id);
        return Ok();
    }

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        await _userService.DeleteCurrentUserAsync(User);
        return SignOut();
         // DOES NOT WORK YET, AS THE ADMIN FOR OUR HYDRA INSTANCE HAS NOT ADDED THE LOGOUT URL
        /* return SignOut(
            new Microsoft.AspNetCore.Authentication.AuthenticationProperties
            {
                RedirectUri = "/"
            },
            OpenIdConnectDefaults.AuthenticationScheme,
            CookieAuthenticationDefaults.AuthenticationScheme
        ); */
    }

    [HttpGet("login")]
    public IActionResult Login()
    {
        return Challenge(new Microsoft.AspNetCore.Authentication.AuthenticationProperties
        {
            RedirectUri = "/"
        });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        return SignOut();
        // DOES NOT WORK YET, AS THE ADMIN FOR OUR HYDRA INSTANCE HAS NOT ADDED THE LOGOUT URL
        /* return SignOut(
            new Microsoft.AspNetCore.Authentication.AuthenticationProperties
            {
                RedirectUri = "/"
            },
            OpenIdConnectDefaults.AuthenticationScheme,
            CookieAuthenticationDefaults.AuthenticationScheme
        ); */
    }
}