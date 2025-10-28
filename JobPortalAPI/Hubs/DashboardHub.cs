using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace JobPortalAPI.Hubs
{
    public class DashboardHub : Hub
    {
        // Method to broadcast dashboard updates to all connected clients
        public async Task BroadcastDashboardUpdate(string updateType, object data)
        {
            await Clients.All.SendAsync("ReceiveDashboardUpdate", updateType, data);
        }

        // Method to send updates to specific user groups (candidates vs recruiters)
        public async Task BroadcastToGroup(string groupName, string updateType, object data)
        {
            await Clients.Group(groupName).SendAsync("ReceiveDashboardUpdate", updateType, data);
        }

        // Method for clients to join specific groups
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        // Method for clients to leave specific groups
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        // Override connection methods for logging
        public override async Task OnConnectedAsync()
        {
            // Log connection
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Log disconnection
            await base.OnDisconnectedAsync(exception);
        }
    }
}
