import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getStreams } from "../api/streamsApi";
import type { Stream } from "../types/streams";

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

        getStreams()
            .then(setStreams)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));

        connection.on("StreamsUpdated", () => {
            getStreams()
                .then(setStreams)
                .catch(err => setError(err.message));
        });

        if (connection.state === signalR.HubConnectionState.Disconnected) {
            connection.start().catch(err => setError(err.message));
        }
    }, []);

    return { streams, loading, error };
}