export type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    createdAt: string;
    lastLogin: string | null;
    isBanned: boolean;
    role: string;
}
