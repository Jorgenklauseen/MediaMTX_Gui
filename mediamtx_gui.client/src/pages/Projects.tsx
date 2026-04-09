import { useEffect, useState } from "react";
import {
  createProjectStream,
  deleteProjectStream,
  getProjectStreams,
  regenerateProjectStreamKey,
} from "../api/projectsApi";
import { useProjects } from "../hooks/useProjects";
import type { ProjectStream } from "../types/projects";
import "../styles/projects.css";
import { inviteUserToProject } from "../api/invitationApi";

function Projects() {
  const { projects, loading, creating, error, submitProject, removeProject } =
    useProjects();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [projectStreams, setProjectStreams] = useState<
    Record<number, ProjectStream[]>
  >({});
  const [streamNames, setStreamNames] = useState<Record<number, string>>({});
  const [streamErrors, setStreamErrors] = useState<
    Record<number, string | null>
  >({});
  const [loadingStreams, setLoadingStreams] = useState<Record<number, boolean>>(
    {},
  );
  const [creatingStreamForProjectId, setCreatingStreamForProjectId] = useState<
    number | null
  >(null);
  const [regeneratingStreamId, setRegeneratingStreamId] = useState<
    string | null
  >(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState<Record<number, string>>({});
  const [inviteErrors, setInviteErrors] = useState<
    Record<number, string | null>
  >({});
  const [inviteSuccess, setInviteSuccess] = useState<Record<number, boolean>>(
    {},
  );
  const [invitingProjectId, setInvitingProjectId] = useState<number | null>(
    null,
  );
  const [selectedPublishProto, setSelectedPublishProto] = useState<Record<string, string>>({});
  const [selectedPlaybackProto, setSelectedPlaybackProto] = useState<Record<string, string>>({});

  useEffect(() => {
    if (projects.length === 0) {
      setProjectStreams({});
      return;
    }

    void Promise.all(projects.map((project) => loadProjectStreams(project.id)));
  }, [projects]);

  const loadProjectStreams = async (projectId: number) => {
    try {
      setLoadingStreams((current) => ({ ...current, [projectId]: true }));
      setStreamErrors((current) => ({ ...current, [projectId]: null }));

      const streams = await getProjectStreams(projectId);

      setProjectStreams((current) => ({ ...current, [projectId]: streams }));
    } catch {
      setStreamErrors((current) => ({
        ...current,
        [projectId]: "Could not load project streams.",
      }));
    } finally {
      setLoadingStreams((current) => ({ ...current, [projectId]: false }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      await submitProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName("");
      setDescription("");
      setIsCreateOpen(false);
    } catch {
      setFormError("Could not create project.");
    }
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    const confirmed = window.confirm(
      `Delete "${projectName}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeProject(projectId);
    } catch {
      setFormError("Could not delete project.");
    }
  };

  const handleCreateStream = async (projectId: number) => {
    const streamName = streamNames[projectId]?.trim() ?? "";

    if (!streamName) {
      setStreamErrors((current) => ({
        ...current,
        [projectId]: "Stream name is required.",
      }));
      return;
    }

    try {
      setCreatingStreamForProjectId(projectId);
      setStreamErrors((current) => ({ ...current, [projectId]: null }));

      const stream = await createProjectStream(projectId, { name: streamName });

      setProjectStreams((current) => ({
        ...current,
        [projectId]: [stream, ...(current[projectId] ?? [])],
      }));
      setStreamNames((current) => ({ ...current, [projectId]: "" }));
    } catch {
      setStreamErrors((current) => ({
        ...current,
        [projectId]: "Could not create stream.",
      }));
    } finally {
      setCreatingStreamForProjectId(null);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(label);
      window.setTimeout(() => setCopiedValue(null), 2000);
    } catch {
      setFormError(`Could not copy ${label}.`);
    }
  };

  const handleRegenerateKey = async (projectId: number, streamId: string) => {
    try {
      setRegeneratingStreamId(streamId);
      setStreamErrors((current) => ({ ...current, [projectId]: null }));

      const updatedStream = await regenerateProjectStreamKey(
        projectId,
        streamId,
      );

      setProjectStreams((current) => ({
        ...current,
        [projectId]: (current[projectId] ?? []).map((stream) =>
          stream.id === streamId ? updatedStream : stream,
        ),
      }));
    } catch {
      setStreamErrors((current) => ({
        ...current,
        [projectId]: "Could not regenerate stream key.",
      }));
    } finally {
      setRegeneratingStreamId(null);
    }
  };

  const handleDeleteStream = async (projectId: number, streamId: string, streamName: string) => {
    const confirmed = window.confirm(`Delete stream "${streamName}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteProjectStream(projectId, streamId);
      setProjectStreams((current) => ({
        ...current,
        [projectId]: (current[projectId] ?? []).filter((s) => s.id !== streamId),
      }));
    } catch {
      setStreamErrors((current) => ({
        ...current,
        [projectId]: "Could not delete stream.",
      }));
    }
  };

  const handleInvite = async (projectId: number) => {
    const email = inviteEmails[projectId]?.trim() ?? "";

    if (!email) {
      setInviteErrors((current) => ({
        ...current,
        [projectId]: "Email is required.",
      }));
      return;
    }

    try {
      setInvitingProjectId(projectId);
      setInviteErrors((current) => ({ ...current, [projectId]: null }));

      await inviteUserToProject(projectId, email);

      setInviteEmails((current) => ({ ...current, [projectId]: "" }));
      setInviteSuccess((current) => ({ ...current, [projectId]: true }));
      window.setTimeout(
        () =>
          setInviteSuccess((current) => ({ ...current, [projectId]: false })),
        3000,
      );
    } catch {
      setInviteErrors((current) => ({
        ...current,
        [projectId]: "Could not send invitation.",
      }));
    } finally {
      setInvitingProjectId(null);
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
              Every project you belong to is collected here. Open the create
              panel with the plus button when you want to start a new one.
            </p>
          </div>

          <button
            type="button"
            className="projects-create-button"
            aria-label={
              isCreateOpen ? "Close create project form" : "Create project"
            }
            onClick={() => {
              setIsCreateOpen((value) => !value);
              setFormError(null);
            }}
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
                  onChange={(event) => setName(event.target.value)}
                  disabled={creating}
                  placeholder="Enter a project name"
                />
              </div>

              <div className="projects-field">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={creating}
                  placeholder="Optional description"
                />
              </div>

              {formError && (
                <p className="projects-message projects-message-error">
                  {formError}
                </p>
              )}

              <div className="projects-form-actions">
                <button
                  type="button"
                  className="projects-secondary-button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setFormError(null);
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="projects-primary-button"
                  disabled={creating}
                >
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
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
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
              <p>
                Press the + button to create your first project and it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article key={project.id} className="project-card">
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

                  {project.role.toLowerCase() === "owner" && (
                    <div className="project-card-actions">
                      {project.role.toLowerCase() === "owner" && (
                        <section className="project-invite-section">
                          <span className="project-meta-label">
                            Invite member
                          </span>
                          <div className="project-stream-create">
                            <input
                              type="email"
                              value={inviteEmails[project.id] ?? ""}
                              onChange={(event) =>
                                setInviteEmails((current) => ({
                                  ...current,
                                  [project.id]: event.target.value,
                                }))
                              }
                              placeholder="Email address"
                              disabled={invitingProjectId === project.id}
                            />
                            <button
                              type="button"
                              className="projects-primary-button"
                              onClick={() => void handleInvite(project.id)}
                              disabled={invitingProjectId === project.id}
                            >
                              {invitingProjectId === project.id
                                ? "Sending..."
                                : "Send invite"}
                            </button>
                          </div>

                          {inviteErrors[project.id] && (
                            <p className="projects-message projects-message-error">
                              {inviteErrors[project.id]}
                            </p>
                          )}
                          {inviteSuccess[project.id] && (
                            <p className="projects-message projects-message-success">
                              Invitation sent!
                            </p>
                          )}
                        </section>
                      )}
                      <button
                        type="button"
                        className="project-delete-button"
                        onClick={() =>
                          void handleDelete(project.id, project.name)
                        }
                      >
                        Delete project
                      </button>
                    </div>
                  )}

                  <section className="project-streams-section">
                    <div className="project-streams-header">
                      <div>
                        <span className="project-meta-label">OBS Ingest</span>
                        <h4>Project streams</h4>
                      </div>
                      <span className="projects-count">
                        {(projectStreams[project.id] ?? []).length} streams
                      </span>
                    </div>

                    <div className="project-stream-create">
                      <input
                        type="text"
                        value={streamNames[project.id] ?? ""}
                        onChange={(event) =>
                          setStreamNames((current) => ({
                            ...current,
                            [project.id]: event.target.value,
                          }))
                        }
                        placeholder="New stream name"
                        disabled={creatingStreamForProjectId === project.id}
                      />
                      <button
                        type="button"
                        className="projects-primary-button"
                        onClick={() => void handleCreateStream(project.id)}
                        disabled={creatingStreamForProjectId === project.id}
                      >
                        {creatingStreamForProjectId === project.id
                          ? "Generating..."
                          : "Create stream"}
                      </button>
                    </div>

                    {streamErrors[project.id] && (
                      <p className="projects-message projects-message-error">
                        {streamErrors[project.id]}
                      </p>
                    )}

                    {loadingStreams[project.id] ? (
                      <p className="project-streams-empty">
                        Loading project streams...
                      </p>
                    ) : (projectStreams[project.id] ?? []).length === 0 ? (
                      <p className="project-streams-empty">
                        No streams yet. Create one to get the OBS publish
                        details.
                      </p>
                    ) : (
                      <div className="project-stream-list">
                        {(projectStreams[project.id] ?? []).map((stream) => (
                          <article
                            key={stream.id}
                            className="project-stream-card"
                          >
                            <div className="project-stream-card-header">
                              <div>
                                <h4>{stream.displayPath}</h4>
                                <p className="project-stream-created">
                                  Created{" "}
                                  {new Date(stream.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {stream.hasVisibleSecret && (
                                <span className="project-stream-secret-badge">
                                  Key visible now
                                </span>
                              )}
                            </div>

                            {(() => {
                              const publishProto = selectedPublishProto[stream.id] ?? stream.publishOptions[0]?.protocol;
                              const playbackProto = selectedPlaybackProto[stream.id] ?? stream.playbackOptions[0]?.protocol;
                              const publishOption = stream.publishOptions.find(o => o.protocol === publishProto);
                              const playbackOption = stream.playbackOptions.find(o => o.protocol === playbackProto);

                              return (
                                <>
                                  <div className="project-stream-proto-row">
                                    <span className="project-meta-label">Publish via</span>
                                    <select
                                      value={publishProto}
                                      onChange={e => setSelectedPublishProto(prev => ({ ...prev, [stream.id]: e.target.value }))}
                                    >
                                      {stream.publishOptions.map(o => (
                                        <option key={o.protocol} value={o.protocol}>{o.protocol} — {o.note}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="project-stream-detail-grid">
                                    <div className="project-stream-detail">
                                      <span className="project-meta-label">OBS Server</span>
                                      <code>{publishOption?.serverUrl}</code>
                                    </div>
                                    <div className="project-stream-detail">
                                      <span className="project-meta-label">Stream Key</span>
                                      <code>{publishOption?.streamKey}</code>
                                    </div>
                                  </div>

                                  <div className="project-stream-proto-row">
                                    <span className="project-meta-label">Playback via</span>
                                    <select
                                      value={playbackProto}
                                      onChange={e => setSelectedPlaybackProto(prev => ({ ...prev, [stream.id]: e.target.value }))}
                                    >
                                      {stream.playbackOptions.map(o => (
                                        <option key={o.protocol} value={o.protocol}>{o.protocol} — {o.note}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="project-stream-detail-grid">
                                    <div className="project-stream-detail">
                                      <span className="project-meta-label">Playback URL</span>
                                      <code>{playbackOption?.url}</code>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}

                            <div className="project-stream-actions">
                              {stream.canRotateKey && (
                                <button
                                  type="button"
                                  className="projects-secondary-button"
                                  onClick={() => void handleRegenerateKey(project.id, stream.id)}
                                  disabled={regeneratingStreamId === stream.id}
                                >
                                  {regeneratingStreamId === stream.id ? "Regenerating..." : "Regenerate key"}
                                </button>
                              )}
                              {stream.hasVisibleSecret && (
                                <button
                                  type="button"
                                  className="projects-secondary-button"
                                  onClick={() => {
                                    const proto = selectedPublishProto[stream.id] ?? stream.publishOptions[0]?.protocol;
                                    const option = stream.publishOptions.find(o => o.protocol === proto);
                                    void handleCopy(option?.streamKey ?? "", "stream key");
                                  }}
                                >
                                  Copy stream key
                                </button>
                              )}
                              <button
                                type="button"
                                className="projects-secondary-button"
                                onClick={() => {
                                  const proto = selectedPublishProto[stream.id] ?? stream.publishOptions[0]?.protocol;
                                  const option = stream.publishOptions.find(o => o.protocol === proto);
                                  void handleCopy(option?.serverUrl ?? "", "OBS server URL");
                                }}
                              >
                                Copy OBS server
                              </button>
                              <button
                                type="button"
                                className="projects-secondary-button"
                                onClick={() => {
                                  const proto = selectedPlaybackProto[stream.id] ?? stream.playbackOptions[0]?.protocol;
                                  const option = stream.playbackOptions.find(o => o.protocol === proto);
                                  void handleCopy(option?.url ?? "", "playback URL");
                                }}
                              >
                                Copy playback URL
                              </button>
                              {stream.canRotateKey && (
                                <button
                                  type="button"
                                  className="project-delete-button"
                                  onClick={() => void handleDeleteStream(project.id, stream.id, stream.displayPath)}
                                >
                                  Delete stream
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {copiedValue && (
                      <p className="project-copy-feedback">
                        {copiedValue} copied.
                      </p>
                    )}
                  </section>
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
