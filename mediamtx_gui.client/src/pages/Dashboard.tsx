import { useState } from "react";
import { useStreams } from "../hooks/useStreams";
import { StreamCard } from "../components/StreamCard";
import { SearchBar } from "../components/SearchBar";
import { parseStreamName } from "../utils";

function Dashboard() {
  const { streams, error, loading } = useStreams();
  const [query, setQuery] = useState("");

  if (loading) return <div>Laster...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const q = query.toLowerCase();
  const filtered = q
    ? streams.filter((stream) => {
        const { streamName, projectName } = parseStreamName(stream.name);
        return streamName.toLowerCase().includes(q) || projectName?.toLowerCase().includes(q);
      })
    : streams;

  const totalProjects = new Set(streams.map((s) => parseStreamName(s.name).projectName ?? "Other")).size;

  const grouped = filtered.reduce<Record<string, typeof streams>>((acc, stream) => {
    const { projectName } = parseStreamName(stream.name);
    const key = projectName ?? "Other";
    (acc[key] ??= []).push(stream);
    return acc;
  }, {});

  const filteredProjectCount = Object.keys(grouped).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Livestreams</h2>
        <SearchBar value={query} onChange={setQuery} placeholder="Search streams or projects..." />
      </div>
      <p className="dashboard-results-info">
        {filtered.length}/{streams.length} streams · {filteredProjectCount}/{totalProjects} projects
      </p>
      {filteredProjectCount === 0 && q && (
        <p className="dashboard-empty">No streams match "{query}".</p>
      )}
      {Object.entries(grouped).map(([project, projectStreams]) => (
        <div key={project} className="dashboard-project-section">
          <h3 className="dashboard-project-heading">{project}</h3>
          <div className="dashboard-grid">
            {projectStreams.map((stream) => (
              <StreamCard key={stream.source?.id ?? stream.name} stream={stream} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;