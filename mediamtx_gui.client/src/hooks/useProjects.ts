import { useEffect, useState } from "react";
import { createProject, deleteProject, getProjects } from "../api/projectsApi";
import type { CreateProjectPayload, Project } from "../types/projects";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const submitProject = async (payload: CreateProjectPayload) => {
        try {
            setCreating(true);
            setError(null);
            await createProject(payload);
            await loadProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            throw err;
        } finally {
            setCreating(false);
        }
    };

    const removeProject = async (projectId: number) => {
        try {
            setError(null);
            await deleteProject(projectId);
            await loadProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            throw err;
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    return {
        projects,
        loading,
        creating,
        error,
        reload: loadProjects,
        submitProject,
        removeProject,
    };
}
