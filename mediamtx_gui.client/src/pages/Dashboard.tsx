import { useStreams } from "../hooks/useStreams";
import {StreamCard}  from "../components/StreamCard";

function Dashboard() {
   const { streams, error, loading } = useStreams();

  if (loading) return <div>Laster...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="dashboard-page">
        <h2>Livestreams ({streams.length})</h2>
        <div className="dashboard-grid">
            {streams.map((stream) => (
                <StreamCard key={stream.source?.id ?? stream.name} stream={stream} />
            ))}
        </div>
    </div>
);
} export default Dashboard;