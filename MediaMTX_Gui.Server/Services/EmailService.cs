namespace MediaMTX_Gui.Server.Services;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string projectName, string invitationLink)
    {
        var smtp = _configuration.GetSection("Smtp");

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(smtp["From"] ?? throw new InvalidOperationException("Smtp: Is not configured properly.")));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = $"You are invited to join the project \"{projectName}\"";

        var builder = new BodyBuilder
        {
            HtmlBody = $"""
                <h2>You are invited!</h2>
                <p>You have been invited to join the project <strong>{projectName}</strong>.</p>
                <p><a href="{invitationLink}">Click here to accept the invitation</a></p>
                <p>The link is valid for 7 days.</p>
                """,
            TextBody = $"You are invited to join the project \"{projectName}\".\nAccept here: {invitationLink}"
        };

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtp["Host"], int.Parse(smtp["Port"]!), SecureSocketOptions.None);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
