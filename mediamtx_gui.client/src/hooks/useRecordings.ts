import { useEffect, useState } from "react";
import { createRecording, deleteRecording, getRecordings, startRecording, stopRecording } from "../api/recordingsApi";
import type { CreateRecordingPayload, Recording } from "../types/recordings";

export function useRecordings() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecordings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getRecordings();
            setRecordings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const submitRecording = async (payload: CreateRecordingPayload) => {
        try {
            setCreating(true);
            setError(null);
            await createRecording(payload);
            await loadRecordings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            throw err;
        } finally {
            setCreating(false);
        }
    };

    const removeRecording = async (recordingId: number) => {
        try {
            setError(null);
            await deleteRecording(recordingId);
            await loadRecordings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            throw err;
        }
    };

    const startRecordingSession = async (recordingId: number) => {
        try {
            await startRecording(recordingId);
            await loadRecordings();
        } catch (err) {
            throw err;
        }
    };

    const stopRecordingSession = async (recordingId: number) => {
        try {
            await stopRecording(recordingId);
            await loadRecordings();
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        loadRecordings();
    }, []);

    return {
        recordings,
        loading,
        creating,
        error,
        reload: loadRecordings,
        submitRecording,
        removeRecording,
        startRecordingSession,
        stopRecordingSession,
    };
}