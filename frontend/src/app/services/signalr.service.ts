import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DashboardUpdate {
  updateType: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private dashboardUpdates$ = new BehaviorSubject<DashboardUpdate | null>(null);

  constructor(private authService: AuthService) {}

  // Get connection status as observable
  get connectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // Get dashboard updates as observable
  get dashboardUpdates(): Observable<DashboardUpdate | null> {
    return this.dashboardUpdates$.asObservable();
  }

  // Start SignalR connection
  async startConnection(): Promise<void> {
    if (this.hubConnection) {
      return; // Already connected
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      console.warn('No user token available for SignalR connection');
      return;
    }

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl('/dashboardHub', {
          accessTokenFactory: () => currentUser.token || ''
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.hubConnection.on('ReceiveDashboardUpdate', (updateType: string, data: any) => {
        console.log('Received dashboard update:', updateType, data);
        this.dashboardUpdates$.next({ updateType, data });
      });

      this.hubConnection.onclose(() => {
        console.log('SignalR connection closed');
        this.connectionStatus$.next(false);
      });

      this.hubConnection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
      });

      this.hubConnection.onreconnected(() => {
        console.log('SignalR reconnected');
        this.connectionStatus$.next(true);
      });

      // Start the connection
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this.connectionStatus$.next(true);

      // Join appropriate group based on user role
      const userRole = currentUser.role?.toLowerCase();
      if (userRole === 'candidate' || userRole === 'recruiter') {
        await this.joinGroup(userRole);
      }

    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStatus$.next(false);
      throw error;
    }
  }

  // Stop SignalR connection
  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
      this.connectionStatus$.next(false);
      console.log('SignalR connection stopped');
    }
  }

  // Join a group
  private async joinGroup(groupName: string): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.invoke('JoinGroup', groupName);
        console.log(`Joined SignalR group: ${groupName}`);
      } catch (error) {
        console.error(`Error joining group ${groupName}:`, error);
      }
    }
  }

  // Leave a group
  private async leaveGroup(groupName: string): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.invoke('LeaveGroup', groupName);
        console.log(`Left SignalR group: ${groupName}`);
      } catch (error) {
        console.error(`Error leaving group ${groupName}:`, error);
      }
    }
  }

  // Broadcast update to all clients (for testing/admin purposes)
  async broadcastUpdate(updateType: string, data: any): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.invoke('BroadcastDashboardUpdate', updateType, data);
      } catch (error) {
        console.error('Error broadcasting update:', error);
      }
    }
  }

  // Broadcast update to specific group
  async broadcastToGroup(groupName: string, updateType: string, data: any): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.invoke('BroadcastToGroup', groupName, updateType, data);
      } catch (error) {
        console.error('Error broadcasting to group:', error);
      }
    }
  }
}
