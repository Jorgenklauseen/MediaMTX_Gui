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
