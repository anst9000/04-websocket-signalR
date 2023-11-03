using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace Hubs
{
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;

            Console.WriteLine($"--> Connection established {connectionId}");
            Clients.Client(connectionId).SendAsync("ReceiveConnID", connectionId);
            return base.OnConnectedAsync();
        }

        public async Task SendMessageAsync(string message)
        {
            var connectionId = Context.ConnectionId;

            var routeOb = JsonConvert.DeserializeObject<dynamic>(message);
            string toClient = routeOb.To;

            Console.WriteLine($"--> Message received on: {connectionId}");

            if (toClient == string.Empty)
            {
                await Clients.All.SendAsync("ReceiveMessage", message);
            }
            else
            {
                await Clients.Client(toClient).SendAsync("ReceiveMessage", message);
            }
        }
    }
}