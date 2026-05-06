using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace MediaMTX_Gui.Server.Hubs;

public class DbUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
        => connection.User?.FindFirstValue("db_id");
}
