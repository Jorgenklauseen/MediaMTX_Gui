namespace MediaMTX_Gui.Server.Services;
public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string projectName, string invitationLink);
}