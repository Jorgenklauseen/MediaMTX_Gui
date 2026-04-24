import type {
    CreateProjectPayload,
    CreateProjectStreamPayload,
    Project,
    ProjectStream,
} from "../types/projects";

export async function getProjects(): Promise<Project[]> {
    const response = await fetch("/api/projects");

    if (!response.ok) {
        throw new Error("Could not load projects");
    }

    return response.json();
}

export async function getProjectById(projectId: number): Promise<Project> {
    const response = await fetch(`/api/projects/${projectId}`);

    if (!response.ok) {
        throw new Error("Could not load project");
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

export async function leaveProject(projectId: number): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/leave`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Could not leave project");
    }
}

export async function getProjectStreams(projectId: number): Promise<ProjectStream[]> {
    const response = await fetch(`/api/projects/${projectId}/streams`);

    if (!response.ok) {
        throw new Error("Could not load project streams");
    }

    return response.json();
}

export async function createProjectStream(
    projectId: number,
    payload: CreateProjectStreamPayload,
): Promise<ProjectStream> {
    const response = await fetch(`/api/projects/${projectId}/streams`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Could not create project stream");
    }

    return response.json();
}

export async function deleteProjectStream(
    projectId: number,
    streamId: string,
): Promise<void> {
    const response = await fetch(
        `/api/projects/${projectId}/streams/${streamId}`,
        { method: "DELETE" },
    );

    if (!response.ok) {
        throw new Error("Could not delete stream");
    }
}

// Toggles recording on/off for a project stream
export async function toggleStreamRecording(
    projectId: number,
    streamId: string,
    enabled: boolean,
): Promise<ProjectStream> {
    const response = await fetch(
        `/api/projects/${projectId}/streams/${streamId}/recording`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled }),
        },
    );

    if (!response.ok) {
        throw new Error("Could not toggle recording");
    }

    return response.json();
}

export async function regenerateProjectStreamKey(
    projectId: number,
    streamId: string,
): Promise<ProjectStream> {
    const response = await fetch(
        `/api/projects/${projectId}/streams/${streamId}/regenerate-key`,
        {
            method: "POST",
        },
    );

    if (!response.ok) {
        throw new Error("Could not regenerate stream key");
    }

    return response.json();
}
