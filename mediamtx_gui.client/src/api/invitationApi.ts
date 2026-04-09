export async function inviteUserToProject(projectId: number, email: string): Promise<void> {
    const response = await fetch(`/api/invitation/${projectId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
    });

    if (!response.ok) throw new Error("Could not send invitation");
}

export async function acceptInvitation(token: string): Promise<void> {
    const response = await fetch(`/api/invitation/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
    });

    if (!response.ok) throw new Error("Could not accept invitation");
}