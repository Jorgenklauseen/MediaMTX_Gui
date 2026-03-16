export type Stream = {
    name: string;
    online: boolean;
    onlineTime: string;
    ready: boolean;
    available: boolean;
    tracks: string[];
    bytesReceived: number;
    readers: unknown[];
    source: { type: string; id: string } | null;
};