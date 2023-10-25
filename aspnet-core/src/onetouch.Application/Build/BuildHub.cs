using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.Build
{
    public class BuildHub: Hub
    {
        public async Task SendMessage(string user, string message)
        { await Clients.All.SendAsync("SendBuildMessage", user, message); }
        public void Register()
        {
            //Logger.Debug("A client is registered: " + Context.ConnectionId);
        }
    }
}
