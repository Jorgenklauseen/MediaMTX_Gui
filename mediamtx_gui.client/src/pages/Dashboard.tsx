import { useStreams } from "../hooks/useStreams";
import StreamCard from "../components/StreamCard";

function Dashboard() {
   const { streams, error, loading } = useStreams();

  if (loading) return <div>Laster...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Livestreams ({streams.length})</h2>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
} export default Dashboard;