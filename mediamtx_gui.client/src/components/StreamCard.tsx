import { useNavigate } from "react-router-dom";
import type { Stream } from "../types/streams";
import { useWhepPlayer } from "../hooks/useWhepPlayer";
import { parseStreamName, formatBytes } from "../utils";
import { FaEye} from "react-icons/fa";
import "../styles/streams.css";

type Props = {
  stream: Stream;
  resolvedProjectName?: string;
};

export function StreamCard({ stream, resolvedProjectName }: Props) {
  const navigate = useNavigate();
  const isLive = stream.online;
  const { streamName, projectName } = parseStreamName(stream.name);
  const displayProjectName = resolvedProjectName ?? projectName;
  const url = isLive ? `/webrtc/${stream.name}/whep` : null;
  const videoRef = useWhepPlayer(url);

  return (
    <div
      className={`stream-card ${isLive ? "stream-card--live" : ""}`}
      onClick={() => isLive && navigate(`/stream?name=${encodeURIComponent(stream.name)}`)}
    >
      <div className="stream-thumbnail">
        {isLive && <span className="stream-badge stream-badge--live">● LIVE</span>}
        <span className="stream-badge stream-badge--viewers"><FaEye /> {stream.readers.length}</span>
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          className={`stream-video ${isLive ? "stream-video--visible" : ""}`}
        />
      </div>

      <div className="stream-info">
        <p className="stream-name">
          {streamName}{displayProjectName && (
  <span className="stream-project">
    {resolvedProjectName && projectName
      ? ` (${resolvedProjectName} · ${projectName})`
      : ` (${displayProjectName})`}
  </span>
)}
        </p>
        <p className="stream-tracks">{stream.tracks.join(" · ")}</p>
        <p className="stream-bytes">{formatBytes(stream.bytesReceived)} received</p>
      </div>
    </div>
  );
}
