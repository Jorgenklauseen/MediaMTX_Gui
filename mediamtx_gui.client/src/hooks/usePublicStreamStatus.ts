import { useEffect, useRef, useState } from "react";
import { streamsHubConnection, ensureConnected } from "../lib/streamsHub";

type PublicStreamStatus = {
    online: boolean;
    onlineTime: string | null;
    readerCount: number;
};

export function usePublicStreamStatus(path: string | null) {
    const [status, setStatus] = useState<PublicStreamStatus>({ online: false, onlineTime: null, readerCount: 0 });
    const [loading, setLoading] = useState(true);
    const hasStarted = useRef(false);

    const fetchStatus = async () => {
        if (!path) return;
        try {
            const response = await fetch(`/api/streams/view?path=${encodeURIComponent(path)}`);
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            } else {
                setStatus({ online: false, onlineTime: null, readerCount: 0 });
            }
        } catch {
            setStatus({ online: false, onlineTime: null, readerCount: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!path) return;
        if (hasStarted.current) return;
        hasStarted.current = true;

        fetchStatus();

        streamsHubConnection.on("StreamsUpdated", fetchStatus);
        ensureConnected();

        return () => {
            streamsHubConnection.off("StreamsUpdated", fetchStatus);
        };
    }, [path]);

    return { status, loading };
}
