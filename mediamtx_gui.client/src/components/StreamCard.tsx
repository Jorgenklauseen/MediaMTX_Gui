import type { Stream } from "../hooks/useStreams";

type Props = {
  stream: Stream;
};

function StreamCard({ stream }: Props) {
  const isLive = stream.status === "active";

  return (
    <div style={styles.card}>
      {/* Thumbnail */}
      <div style={styles.thumbnail}>
        {isLive && <span style={styles.liveBadge}>● LIVE</span>}
        <span style={styles.viewerBadge}>👁 {stream.readers}</span>
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
  },
  liveBadge: { background: "#e91916", color: "#fff", padding: "2px 6px" },
  viewerBadge: { background: "rgba(0,0,0,.7)", color: "#efeff1", padding: "2px 6px" },
  info: { padding: 8 },
  name: { margin: 0, color: "#efeff1" },
  sub: { margin: 0, color: "#adadb8", fontSize: 12 },
};

export default StreamCard;