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

export type ProjectStream = {
    id: string;
    projectId: number;
    name: string;
    path: string;
    displayPath: string;
    publishUser: string;
    maskedStreamKey: string;
    obsServerUrl: string;
    obsStreamKey: string;
    obsPlaybackUrl: string;
    createdAt: string;
    hasVisibleSecret: boolean;
    canRotateKey: boolean;
};

export type CreateProjectStreamPayload = {
    name: string;
};
