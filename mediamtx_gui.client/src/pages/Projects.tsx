import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import "../styles/projects.css";

function Projects() {
  const navigate = useNavigate();
  const { projects, loading, creating, error, submitProject } = useProjects();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Project name is required.");
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
                <label htmlFor="project-name">Name</label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={creating}
                  placeholder="Enter a project name"
                />
              </div>

              <div className="projects-field">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={creating}
                  placeholder="Optional description"
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

        <section className="projects-list-section">
          <div className="projects-list-header">
            <div>
              <p className="projects-eyebrow">Overview</p>
              <h2>Your projects</h2>
            </div>
            {!loading && !error && projects.length > 0 && (
              <span className="projects-count">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
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
          ) : projects.length === 0 ? (
            <div className="projects-state-card">
              <h3>No projects yet</h3>
              <p>Press the + button to create your first project and it will appear here.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(project => (
                <article
                  key={project.id}
                  className="project-card project-card--clickable"
                  onClick={() => navigate(`/projects/${project.id}`)}
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
                      <span className="project-meta-value">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="project-meta-block">
                      <span className="project-meta-label">Access</span>
                      <span className="project-meta-value">{project.role}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Projects;
