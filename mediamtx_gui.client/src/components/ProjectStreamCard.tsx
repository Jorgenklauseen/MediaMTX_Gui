import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ProjectStream } from "../types/projects";
import { useWhepPlayer } from "../hooks/useWhepPlayer";

type Props = {
  stream: ProjectStream;
  projectId: number;
  isLive: boolean;
  onRegenerate: (projectId: number, streamId: string) => Promise<void>;
  onDelete: (projectId: number, streamId: string, displayPath: string) => Promise<void>;
  onToggleRecording: (projectId: number, streamId: string, enabled: boolean) => Promise<void>;
  regenerating: boolean;
  togglingRecording: boolean;
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      className="copy-icon-btn"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function ProjectStreamCard({ stream, projectId, isLive, onRegenerate, onDelete, onToggleRecording, regenerating, togglingRecording }: Props) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [publishProto, setPublishProto] = useState(stream.publishOptions[0]?.protocol ?? "");
  const [playbackProto, setPlaybackProto] = useState(stream.playbackOptions[0]?.protocol ?? "");

  const publishOption = stream.publishOptions.find(o => o.protocol === publishProto);
  const playbackOption = stream.playbackOptions.find(o => o.protocol === playbackProto);

  const whepUrl = playbackProto === "WebRTC" ? (playbackOption?.url ?? null) : null;
  const whepVideoRef = useWhepPlayer(whepUrl);

  const previewUrl = isLive
    ? (stream.playbackOptions.find(o => o.protocol === "WebRTC")?.url ?? null)
    : null;
  const previewRef = useWhepPlayer(previewUrl);

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
          {isLive && <span className="stream-live-badge">LIVE</span>}
          {stream.hasVisibleSecret && (
            <span className="project-stream-secret-badge">Key visible now</span>
          )}
          <span>{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {isLive && (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/stream?name=${encodeURIComponent(stream.path)}`)}
          title="Click to open stream view"
        >
          <video
            ref={previewRef}
            muted
            autoPlay
            playsInline
            className="project-stream-video"
          />
        </div>
      )}

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
            {publishOption?.serverUrl && (
              <div className="project-stream-detail">
                <span className="project-meta-label">OBS Server</span>
                <div className="project-stream-copyable">
                  <code>{publishOption.serverUrl}</code>
                  <CopyButton value={publishOption.serverUrl} />
                </div>
              </div>
            )}
            {publishOption?.streamKey != null && (
              <div className="project-stream-detail">
                <span className="project-meta-label">Stream Key</span>
                <div className="project-stream-copyable">
                  <code>{publishOption.streamKey}</code>
                  <CopyButton value={publishOption.streamKey} />
                </div>
              </div>
            )}
            {!publishOption?.serverUrl && (
              <div className="project-stream-detail">
                <span className="project-meta-label">Note</span>
                <span className="project-stream-created">{publishOption?.note}</span>
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
              <div className="project-stream-copyable">
                <code>{playbackOption?.url}</code>
                {playbackOption?.url && <CopyButton value={playbackOption.url} />}
              </div>
            </div>
          </div>

          {playbackProto === "WebRTC" && (
            <video
              ref={whepVideoRef}
              muted
              autoPlay
              playsInline
              className="project-stream-video"
            />
          )}

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
            {stream.canRotateKey && (
              <button
                type="button"
                className="project-delete-stream-button"
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
