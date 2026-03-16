import type { Stream } from "../types/streams";
import { useHls } from "../hooks/useHlsPlayer";
import "../styles/streams.css";

type Props = {
  stream: Stream;
};

export function StreamCard({ stream }: Props) {
  const isLive = stream.online;
  const url = isLive ? `/hls/${stream.name}/index.m3u8` : null;
  const videoRef = useHls(url);

  return (
    <div
      className={`stream-card ${isLive ? "stream-card--live" : ""}`}
      onClick={() => isLive && window.open(`/hls/${stream.name}/`, "_blank")}
    >
      <div className="stream-thumbnail">
        {isLive && <span className="stream-badge stream-badge--live">● LIVE</span>}
        <span className="stream-badge stream-badge--viewers">👁 {stream.readers.length}</span>
        <video
          ref={videoRef}
          muted
          className={`stream-video ${isLive ? "stream-video--visible" : ""}`}
        />
      </div>

      <div className="stream-info">
        <p className="stream-name">{stream.name}</p>
        <p className="stream-tracks">{stream.tracks.join(" · ")}</p>
        <p className="stream-bytes">{(stream.bytesReceived / 1000000).toFixed(2)} MB received</p>
      </div>
    </div>
  );
}
