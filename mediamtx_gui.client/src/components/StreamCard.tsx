import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import type { Stream } from "../hooks/useStreams";

type Props = {
  stream: Stream;
};

function StreamCard({ stream }: Props) {
  const navigate = useNavigate();
  const isLive = stream.status === "active";
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hovering, setHovering] = useState(false);

  const handleMouseEnter = () => {
    if (!isLive) return;
    setHovering(true);

    const video = videoRef.current;
    if (!video) return;

    const url = `/hls/${stream.name}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play();
    }
  };

  const handleMouseLeave = () => {
    setHovering(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = "";
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  return (
    <div
      style={{ ...styles.card, cursor: isLive ? "pointer" : "default" }}
      onClick={() => isLive && window.open(`/hls/${stream.name}/`, '_blank')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Preview */}
      <div style={styles.thumbnail}>
        {isLive && <span style={styles.liveBadge}>● LIVE</span>}
        <span style={styles.viewerBadge}>👁 {stream.readers}</span>

        {/* Video preview */}
        <video
          ref={videoRef}
          muted
          style={{
            ...styles.video,
            opacity: hovering && isLive ? 1 : 0,
          }}
        />
      </div>

      {/* Info */}
      <div style={styles.info}>
        <p style={styles.name}>{stream.name}</p>
        <p style={styles.sub}>{stream.tracks.join(" · ")}</p>
        <p>{(stream.bytesReceived / 1000000).toFixed(2)} MB received</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: "#0e0e10", borderRadius: 6 },
  thumbnail: {
    aspectRatio: "16/9",
    background: "#1a1a22",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 8,
    position: "relative",
    overflow: "hidden",
  },
  liveBadge: {
    background: "#e91916",
    color: "#fff",
    padding: "2px 6px",
    zIndex: 1,
    position: "relative",
  },
  viewerBadge: {
    background: "rgba(0,0,0,.7)",
    color: "#efeff1",
    padding: "2px 6px",
    zIndex: 1,
    position: "relative",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.3s ease",
    zIndex: 0,
    cursor: "pointer",
  },
  info: { padding: 8 },
  name: { margin: 0, color: "#efeff1" },
  sub: { margin: 0, color: "#adadb8", fontSize: 12 },
};

export default StreamCard;
