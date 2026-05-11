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
    projectStreamId: string | null;
    streamName: string;
    projectName: string | null;
    createdById: number;
    createdByName: string;
}

export interface CreateRecordingPayload {
    name: string;
    description: string;
    projectStreamId: string;
}

export interface RecordingFile {
    name: string;
    size: number;
    url: string;
}