import type { User } from "../types/users";

export async function getUsers(): Promise<User[]> {
    const response = await fetch("/api/users");

    if (!response.ok) {
        throw new Error("Could not load users");
    }
    return response.json();
}

export async function banUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}/ban`,
        { method: "POST" });

    if (!response.ok) {
        throw new Error("Could not ban user");
    }
}

export async function unbanUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}/unban`, 
        { method: "POST" });

    if (!response.ok) {
        throw new Error("Could not unban user");
    }
}