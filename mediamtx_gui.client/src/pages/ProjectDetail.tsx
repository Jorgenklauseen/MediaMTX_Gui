import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProjectById, deleteProject, getProjectStreams } from "../api/projectsApi";
import { ProjectCard } from "../components/ProjectCard";
import { useStreams } from "../hooks/useStreams";
import type { Project, ProjectStream } from "../types/projects";
import "../styles/projects.css";

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { streams: liveStreams } = useStreams();
  const livePaths = new Set(liveStreams.filter(s => s.ready).map(s => s.name));

  const [project, setProject] = useState<Project | null>(null);
  const [streams, setStreams] = useState<ProjectStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    void (async () => {
      try {
        setLoading(true);
        const p = await getProjectById(projectId);
        setProject(p);
      } catch {
        setError("Could not load project.");
      } finally {
        setLoading(false);
      }
    })();

    void (async () => {
      try {
        setLoadingStreams(true);
        const s = await getProjectStreams(projectId);
        setStreams(s);
      } catch {
        setStreams([]);
      } finally {
        setLoadingStreams(false);
      }
    })();
  }, [projectId]);

  const handleDelete = async (pid: number, projectName: string) => {
    const confirmed = window.confirm(`Delete "${projectName}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteProject(pid);
      toast.success(`Project "${projectName}" deleted.`);
      navigate("/projects");
    } catch {
      setError("Could not delete project.");
    }
  };

  const handleStreamsChange = (_pid: number, updated: ProjectStream[]) => {
    setStreams(updated);
  };

  if (loading) {
    return (
      <section className="projects-page">
        <div className="projects-shell">
          <div className="projects-state-card">
            <h3>Loading project...</h3>
          </div>
        </div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="projects-page">
        <div className="projects-shell">
          <p className="projects-message projects-message-error">{error ?? "Project not found."}</p>
          <button type="button" className="projects-secondary-button" onClick={() => navigate("/projects")}>
            Back to projects
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-page">
      <div className="projects-shell">
        <header className="projects-header">
          <div className="projects-header-copy">
            <button
              type="button"
              className="projects-secondary-button"
              onClick={() => navigate("/projects")}
            >
              ← Projects
            </button>
            <h1>{project.name}</h1>
            {project.description && (
              <p className="projects-subtitle">{project.description}</p>
            )}
          </div>
        </header>

        <ProjectCard
          project={project}
          streams={streams}
          loading={loadingStreams}
          livePaths={livePaths}
          onStreamsChange={handleStreamsChange}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}

export default ProjectDetail;
