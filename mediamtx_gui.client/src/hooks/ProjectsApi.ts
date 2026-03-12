import type { CreateProjectPayload, Project } from "../types/projects";

export async function getProjects(): Promise<Project[]> {
    const response = await fetch("/api/projects");

    if (!response.ok) {
        throw new Error("Could not load projects");
    }

    return response.json();
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Could not create project");
    }

    return response.json();
}

export async function deleteProject(projectId: number): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Could not delete project");
    }
}
