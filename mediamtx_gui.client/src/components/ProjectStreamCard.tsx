import { useState } from "react";
import type { ProjectStream } from "../types/projects";

type Props = {
  stream: ProjectStream;
  projectId: number;
  onRegenerate: (projectId: number, streamId: string) => Promise<void>;
  onDelete: (projectId: number, streamId: string, displayPath: string) => Promise<void>;
  onCopy: (value: string, label: string) => Promise<void>;
  onToggleRecording: (projectId: number, streamId: string, enabled: boolean) => Promise<void>;
  regenerating: boolean;
  togglingRecording: boolean;
};

export function ProjectStreamCard({ stream, projectId, onRegenerate, onDelete, onCopy, onToggleRecording, regenerating, togglingRecording }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [publishProto, setPublishProto] = useState(stream.publishOptions[0]?.protocol ?? "");
  const [playbackProto, setPlaybackProto] = useState(stream.playbackOptions[0]?.protocol ?? "");

  const publishOption = stream.publishOptions.find(o => o.protocol === publishProto);
  const playbackOption = stream.playbackOptions.find(o => o.protocol === playbackProto);

  return (
    <article className="project-stream-card">
      <div
        className="project-stream-card-header"
        onClick={() => setCollapsed(c => !c)}
        style={{ cursor: "pointer" }}
      >
        <div>
          <h4>{stream.displayPath}</h4>
          <p className="project-stream-created">
            Created {new Date(stream.createdAt).toLocaleString()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {stream.hasVisibleSecret && (
            <span className="project-stream-secret-badge">Key visible now</span>
          )}
          <span>{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="project-stream-proto-row">
            <span className="project-meta-label">Publish via</span>
            <select value={publishProto} onChange={e => setPublishProto(e.target.value)}>
              {stream.publishOptions.map(o => (
                <option key={o.protocol} value={o.protocol}>{o.protocol} — {o.note}</option>
              ))}
            </select>
          </div>

          <div className="project-stream-detail-grid">
            <div className="project-stream-detail">
              <span className="project-meta-label">OBS Server</span>
              {publishOption?.serverUrl
                ? <code>{publishOption.serverUrl}</code>
                : <span className="project-stream-created">{publishOption?.note}</span>
              }
            </div>
            {publishOption?.streamKey != null && (
              <div className="project-stream-detail">
                <span className="project-meta-label">Stream Key</span>
                <code>{publishOption.streamKey}</code>
              </div>
            )}
            {publishOption?.serverUrl && publishOption.streamKey === null && (
              <div className="project-stream-detail">
                <span className="project-meta-label">Note</span>
                <span className="project-stream-created">{publishOption.note}</span>
              </div>
            )}
          </div>

          <div className="project-stream-proto-row">
            <span className="project-meta-label">Playback via</span>
            <select value={playbackProto} onChange={e => setPlaybackProto(e.target.value)}>
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

          <div className="project-stream-actions">
            {stream.canRotateKey && (
              <button
                type="button"
                className={`stream-recording-toggle ${stream.recordingEnabled ? "stream-recording-toggle--on" : ""}`}
                onClick={() => void onToggleRecording(projectId, stream.id, !stream.recordingEnabled)}
                disabled={togglingRecording}
                title={stream.recordingEnabled ? "Recording enabled — click to disable" : "Recording disabled — click to enable"}
              >
                {togglingRecording ? "Saving..." : stream.recordingEnabled ? "Recording ON" : "Recording OFF"}
              </button>
            )}
            {stream.canRotateKey && (
              <button
                type="button"
                className="projects-secondary-button"
                onClick={() => void onRegenerate(projectId, stream.id)}
                disabled={regenerating}
              >
                {regenerating ? "Regenerating..." : "Regenerate key"}
              </button>
            )}
            {stream.hasVisibleSecret && (
              <button
                type="button"
                className="projects-secondary-button"
                onClick={() => void onCopy(publishOption?.streamKey ?? "", "stream key")}
              >
                Copy stream key
              </button>
            )}
            <button
              type="button"
              className="projects-secondary-button"
              onClick={() => void onCopy(publishOption?.serverUrl ?? "", "OBS server URL")}
            >
              Copy OBS server
            </button>
            <button
              type="button"
              className="projects-secondary-button"
              onClick={() => void onCopy(playbackOption?.url ?? "", "playback URL")}
            >
              Copy playback URL
            </button>
            {stream.canRotateKey && (
              <button
                type="button"
                className="project-delete-button"
                onClick={() => void onDelete(projectId, stream.id, stream.displayPath)}
              >
                Delete stream
              </button>
            )}
          </div>
        </>
      )}
    </article>
  );
}
