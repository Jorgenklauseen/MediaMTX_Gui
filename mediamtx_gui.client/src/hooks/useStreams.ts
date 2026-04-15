import { useEffect, useRef, useState } from "react";
import { getStreams } from "../api/streamsApi";
import type { Stream } from "../types/streams";
import { streamsHubConnection, ensureConnected } from "../lib/streamsHub";

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

        streamsHubConnection.on("StreamsUpdated", () => {
            getStreams()
                .then(setStreams)
                .catch(err => setError(err.message));
        });

        ensureConnected();
    }, []);

    return { streams, loading, error };
}