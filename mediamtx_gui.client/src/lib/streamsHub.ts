import * as signalR from "@microsoft/signalr";

// Shared SignalR connection for the streams hub.

export const streamsHubConnection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/streams")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Error)
    .build();

export function ensureConnected() {
    if (streamsHubConnection.state === signalR.HubConnectionState.Disconnected) {
        streamsHubConnection.start().catch(console.error);
    }
}
