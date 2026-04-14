import type { CreateRecordingPayload, Recording, RecordingFile } from "../types/recordings";

export async function getRecordings(): Promise<Recording[]> {
    const response = await fetch("/api/recordings");
    if (!response.ok) throw new Error("Could not load recordings");
    return response.json();
}

export async function createRecording(payload: CreateRecordingPayload): Promise<Recording> {
    const response = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Could not create recording");
    return response.json();
}

export async function deleteRecording(recordingId: number): Promise<void> {
    const response = await fetch(`/api/recordings/${recordingId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not delete recording");
}

export async function startRecording(recordingId: number): Promise<void> {
    const response = await fetch(`/api/recordings/${recordingId}/start`, { method: "POST" });
    if (!response.ok) throw new Error("Could not start recording");
}

export async function stopRecording(recordingId: number): Promise<void> {
    const response = await fetch(`/api/recordings/${recordingId}/stop`, { method: "POST" });
    if (!response.ok) throw new Error("Could not stop recording");
}

export async function getRecordingFiles(recordingId: number): Promise<RecordingFile[]> {
    const response = await fetch(`/api/recordings/${recordingId}/files`);
    if (!response.ok) throw new Error("Could not load recording files");
    return response.json();
}