export interface Recording {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
    status: 'pending' | 'recording' | 'completed' | 'failed';
    filePath: string;
    fileSize: number;
    duration: string; // ISO 8601 duration
    streamId: string;
    streamName: string;
    createdById: number;
    createdByName: string;
}

export interface CreateRecordingPayload {
    name: string;
    description: string;
    streamId: string;
}

export interface RecordingFile {
    name: string;
    size: number;
    url: string;
}