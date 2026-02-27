import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export type Stream = {
  id: string;
  name: string;
  status: "active" | "inactive";
  lastActive: string;
  ready: boolean;
  available: boolean;
  tracks: string[];
  bytesReceived: number;
  readers: number;
};

function mapStream(item: any): Stream {
  return {
    id: item.source?.id || item.name,
    name: item.name,
    status: item.online ? "active" : "inactive",
    lastActive: item.onlineTime,
    ready: item.ready,
    available: item.available,
    tracks: item.tracks,
    bytesReceived: item.bytesReceived,
    readers: item.readers.length,
  };
}

function mapStreams(data: any): Stream[] {
  const items = typeof data === "string" ? JSON.parse(data).items : data.items;
  return items.map((item: any) => mapStream(item));
}

const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/streams")
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Error)
  .build();

export function useStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasStarted = useRef(false);

useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    fetch("/api/streams/status")
      .then(res => res.text())
      .then(data => setStreams(mapStreams(data)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    connection.on("StreamsUpdated", (data: any) => {
      console.log("Received stream update:", data);
      setStreams(mapStreams(data));
      setLoading(false);
    });

    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection.start().catch(err => setError(err.message));
    }

  }, []); 

  return { streams, loading, error };
}