export type Project = {
    id: number;
    name: string;
    description: string;
    createdByUserId: number;
    createdAt: string;
    updatedAt: string | null;
    role: string;
};

export type CreateProjectPayload = {
    name: string;
    description?: string;
};
