import { useState } from "react";
import {
  createProjectStream,
  deleteProjectStream,
  regenerateProjectStreamKey,
} from "../api/projectsApi";
import { inviteUserToProject } from "../api/invitationApi";
import type { Project, ProjectStream } from "../types/projects";
import { ProjectStreamCard } from "./ProjectStreamCard";

type Props = {
  project: Project;
  streams: ProjectStream[];
  loading: boolean;
  onStreamsChange: (projectId: number, streams: ProjectStream[]) => void;
  onDelete: (projectId: number, projectName: string) => Promise<void>;
  onCopy: (value: string, label: string) => Promise<void>;
};

export function ProjectCard({ project, streams, loading, onStreamsChange, onDelete, onCopy }: Props) {
  const [streamName, setStreamName] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [regeneratingStreamId, setRegeneratingStreamId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviting, setInviting] = useState(false);

  const isOwner = project.role.toLowerCase() === "owner";

  const handleCreateStream = async () => {
    const trimmed = streamName.trim();
    if (!trimmed) {
      setStreamError("Stream name is required.");
      return;
    }

    try {
      setCreating(true);
      setStreamError(null);
      const stream = await createProjectStream(project.id, { name: trimmed });
      onStreamsChange(project.id, [stream, ...streams]);
      setStreamName("");
    } catch {
      setStreamError("Could not create stream.");
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerate = async (projectId: number, streamId: string) => {
    try {
      setRegeneratingStreamId(streamId);
      setStreamError(null);
      const updated = await regenerateProjectStreamKey(projectId, streamId);
      onStreamsChange(projectId, streams.map(s => s.id === streamId ? updated : s));
    } catch {
      setStreamError("Could not regenerate stream key.");
    } finally {
      setRegeneratingStreamId(null);
    }
  };

  const handleDeleteStream = async (projectId: number, streamId: string, displayPath: string) => {
    const confirmed = window.confirm(`Delete stream "${displayPath}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteProjectStream(projectId, streamId);
      onStreamsChange(projectId, streams.filter(s => s.id !== streamId));
    } catch {
      setStreamError("Could not delete stream.");
    }
  };

  const handleInvite = async () => {
    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      setInviteError("Email is required.");
      return;
    }

    try {
      setInviting(true);
      setInviteError(null);
      await inviteUserToProject(project.id, trimmed);
      setInviteEmail("");
      setInviteSuccess(true);
      window.setTimeout(() => setInviteSuccess(false), 3000);
    } catch {
      setInviteError("Could not send invitation.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <article className="project-card">
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

      {isOwner && (
        <div className="project-card-actions">
          <section className="project-invite-section">
            <span className="project-meta-label">Invite member</span>
            <div className="project-stream-create">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Email address"
                disabled={inviting}
              />
              <button
                type="button"
                className="projects-primary-button"
                onClick={() => void handleInvite()}
                disabled={inviting}
              >
                {inviting ? "Sending..." : "Send invite"}
              </button>
            </div>
            {inviteError && (
              <p className="projects-message projects-message-error">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="projects-message projects-message-success">Invitation sent!</p>
            )}
          </section>
          <button
            type="button"
            className="project-delete-button"
            onClick={() => void onDelete(project.id, project.name)}
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
          <span className="projects-count">{streams.length} streams</span>
        </div>

        <>
            <div className="project-stream-create">
              <input
                type="text"
                value={streamName}
                onChange={e => setStreamName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") void handleCreateStream(); }}
                placeholder="New stream name"
                disabled={creating}
              />
              <button
                type="button"
                className="projects-primary-button"
                onClick={() => void handleCreateStream()}
                disabled={creating}
              >
                {creating ? "Generating..." : "Create stream"}
              </button>
            </div>

            {streamError && (
              <p className="projects-message projects-message-error">{streamError}</p>
            )}

            {loading ? (
              <p className="project-streams-empty">Loading project streams...</p>
            ) : streams.length === 0 ? (
              <p className="project-streams-empty">
                No streams yet. Create one to get the OBS publish details.
              </p>
            ) : (
              <div className="project-stream-list">
                {streams.map(stream => (
                  <ProjectStreamCard
                    key={stream.id}
                    stream={stream}
                    projectId={project.id}
                    onRegenerate={handleRegenerate}
                    onDelete={handleDeleteStream}
                    onCopy={onCopy}
                    regenerating={regeneratingStreamId === stream.id}
                  />
                ))}
              </div>
            )}
        </>
      </section>
    </article>
  );
}
