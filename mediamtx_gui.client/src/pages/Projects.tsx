import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils";
import { SearchBar } from "../components/SearchBar";
import type { Project } from "../types/projects";
import "../styles/projects.css";

function ProjectGrid({ projects, onNavigate }: { projects: Project[]; onNavigate: (id: number) => void }) {
  return (
    <div className="projects-grid">
      {projects.map(project => (
        <article
          key={project.id}
          className="project-card project-card--clickable"
          onClick={() => onNavigate(project.id)}
        >
          <div className="project-card-top">
            <div>
              <h3>{project.name}</h3>
              <p className="project-description">
                {project.description || "No description provided."}
              </p>
            </div>
            <span className="project-role-badge">{project.role}</span>
          </div>
          <div className="project-card-meta">
            <div className="project-meta-block">
              <span className="project-meta-label">Created</span>
              <span className="project-meta-value">{formatDate(project.createdAt)}</span>
            </div>
            <div className="project-meta-block">
              <span className="project-meta-label">Access</span>
              <span className="project-meta-value">{project.role}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Projects() {
  const navigate = useNavigate();
  const { projects, loading, creating, error, submitProject } = useProjects();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const myProjects = projects.filter(p => p.role !== "Admin");
  const otherProjects = projects.filter(p => p.role === "Admin");

  const filter = (list: typeof projects) => search.trim()
    ? list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const filteredMine = filter(myProjects);
  const filteredOther = filter(otherProjects);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }
    if (name.trim().length > 100) {
      setFormError("Project name cannot exceed 100 characters.");
      return;
    }

    try {
      await submitProject({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      setIsCreateOpen(false);
    } catch {
      setFormError("Could not create project.");
    }
  };

  return (
    <section className="projects-page">
      <div className="projects-shell">
        <header className="projects-header">
          <div className="projects-header-copy">
            <p className="projects-eyebrow">Workspace</p>
            <h1>Projects</h1>
            <p className="projects-subtitle">
              Every project you belong to is collected here. Click a project to open it.
            </p>
            <p className="projects-guide-hint">
              Not sure how to start a stream?{" "}
              <button
                type="button"
                className="projects-guide-link"
                onClick={() => navigate("/guides")}
              >
                View the user guide
              </button>
            </p>
          </div>

          <button
            type="button"
            className="projects-create-button"
            aria-label={isCreateOpen ? "Close create project form" : "Create project"}
            onClick={() => { setIsCreateOpen(v => !v); setFormError(null); }}
          >
            {isCreateOpen ? "×" : "+"}
          </button>
        </header>

        {isCreateOpen && (
          <section className="project-create-panel">
            <div className="project-create-panel-header">
              <div>
                <p className="projects-eyebrow">New Project</p>
                <h2>Create project</h2>
              </div>
            </div>

            <form className="projects-form" onSubmit={handleSubmit}>
              <div className="projects-field">
                <label htmlFor="project-name">
                  Name
                  <span className={`projects-char-count ${name.length > 100 ? "projects-char-count--over" : ""}`}>
                    {name.length}/100
                  </span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 100))}
                  disabled={creating}
                  placeholder="Enter a project name"
                  maxLength={100}
                />
              </div>

              <div className="projects-field">
                <label htmlFor="project-description">
                  Description
                  <span className={`projects-char-count ${description.length > 300 ? "projects-char-count--over" : ""}`}>
                    {description.length}/300
                  </span>
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 300))}
                  disabled={creating}
                  placeholder="Optional description"
                  maxLength={300}
                />
              </div>

              {formError && (
                <p className="projects-message projects-message-error">{formError}</p>
              )}

              <div className="projects-form-actions">
                <button
                  type="button"
                  className="projects-secondary-button"
                  onClick={() => { setIsCreateOpen(false); setFormError(null); }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="projects-primary-button" disabled={creating}>
                  {creating ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="projects-toolbar">
          <SearchBar
            placeholder="Search projects..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <section className="projects-list-section">
          <div className="projects-list-header">
            <div>
              <p className="projects-eyebrow">Overview</p>
              <h2>My projects</h2>
            </div>
            {!loading && !error && myProjects.length > 0 && (
              <span className="projects-count">
                {filteredMine.length}{search.trim() ? ` of ${myProjects.length}` : ""} {myProjects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>

          {error && (
            <p className="projects-message projects-message-error">{error}</p>
          )}

          {loading ? (
            <div className="projects-state-card">
              <h3>Loading projects...</h3>
              <p>Fetching the projects you are a part of.</p>
            </div>
          ) : myProjects.length === 0 ? (
            <div className="projects-state-card">
              <h3>No projects yet</h3>
              <p>Press the + button to create your first project and it will appear here.</p>
            </div>
          ) : (
            <ProjectGrid projects={filteredMine} onNavigate={id => navigate(`/projects/${id}`)} />
          )}
        </section>

        {isAdmin && !loading && otherProjects.length > 0 && (
          <section className="projects-list-section">
            <div className="projects-list-header">
              <div>
                <p className="projects-eyebrow">Admin access</p>
                <h2>All other projects</h2>
              </div>
              <span className="projects-count">
                {filteredOther.length}{search.trim() ? ` of ${otherProjects.length}` : ""} {otherProjects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <ProjectGrid projects={filteredOther} onNavigate={id => navigate(`/projects/${id}`)} />
          </section>
        )}
      </div>
    </section>
  );
}

export default Projects;

