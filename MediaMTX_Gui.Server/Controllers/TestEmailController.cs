namespace MediaMTX_Gui.Server.Controllers;

using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using MimeKit;

[ApiController]
public class TestEmailController : ControllerBase
{
    [HttpPost("api/test-email")]
    public async Task<IActionResult> Send()
    {
        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse("no-reply@uia.no"));
        message.To.Add(MailboxAddress.Parse("jorgennk@uia.no"));
        message.Subject = "Test";
        message.Body = new TextPart("plain") { Text = "Testmelding" };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.uia.no", 25, MailKit.Security.SecureSocketOptions.None);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        return Ok("Sendt!");
    }
}