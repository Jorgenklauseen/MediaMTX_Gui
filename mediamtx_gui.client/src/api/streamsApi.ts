import type { Stream } from "../types/streams";


export async function getStreams(): Promise<Stream[]> {
    const response = await fetch("/api/streams/status");

    if (!response.ok) {
        throw new Error("Could not load streams");
    }

    const data = await response.json();
    return data.items;
}