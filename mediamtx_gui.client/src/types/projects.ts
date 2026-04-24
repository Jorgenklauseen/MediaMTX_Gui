export type Project = {
    id: number;
    name: string;
    description: string;
    role: string;
    createdByUserId: number;
    createdAt: string;
    updatedAt: string | null;
};

export type CreateProjectPayload = {
    name: string;
    description?: string;
};

export type StreamProtocolOption = {
    protocol: string;
    serverUrl?: string;
    streamKey?: string;
    url?: string;
    note: string;
};

export type ProjectStream = {
    id: string;
    projectId: number;
    name: string;
    path: string;
    displayPath: string;
    publishUser: string;
    publishOptions: StreamProtocolOption[];
    playbackOptions: StreamProtocolOption[];
    recordingEnabled: boolean; // whether this stream auto-records
    createdAt: string;
    hasVisibleSecret: boolean;
    canRotateKey: boolean;
    createdByName: string | null;
};

export type CreateProjectStreamPayload = {
    name: string;
};
