import { useState, useMemo } from "react";
import { useRecordings } from "../hooks/useRecordings";
import { useProjects } from "../hooks/useProjects";
import { RecordingCard } from "../components/RecordingCard";
import { SearchBar } from "../components/SearchBar";
import { parseStreamName } from "../utils";
import "../styles/recordings.css";

function Recordings() {
  const { recordings, loading, error, removeRecording, startRecordingSession, stopRecordingSession, editDescription } = useRecordings();
  const { projects } = useProjects();
  const [search, setSearch] = useState("");

  const projectNameMap = useMemo(
    () => new Map(projects.map((p) => [`project-${p.id}`, p.name])),
    [projects]
  );

  const filteredRecordings = recordings.filter(recording =>
    recording.name.toLowerCase().includes(search.toLowerCase()) ||
    recording.streamName.toLowerCase().includes(search.toLowerCase()) ||
    recording.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteRecording = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      await removeRecording(id);
    }
  };

  return (
    <section className="recordings-page">
      <div className="recordings-shell">
        <header className="recordings-header">
          <div className="recordings-header-copy">
            <p className="recordings-eyebrow">Media Management</p>
            <h1>Recordings</h1>
            <p className="recordings-subtitle">
              Manage and monitor your media recordings
            </p>
          </div>
        </header>

        <div className="recordings-toolbar">
          <div className="recordings-search">
            <SearchBar
              placeholder="Search recordings..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>

        <div className="recordings-results-info">
          {filteredRecordings.length} of {recordings.length} recordings
        </div>

        {loading ? (
          <div className="recordings-state-card">
            <h3>Loading recordings...</h3>
            <p>Fetching your recordings.</p>
          </div>
        ) : error ? (
          <div className="recordings-state-card">
            <h3>Error loading recordings</h3>
            <p>{error}</p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="recordings-state-card">
            <h3>No recordings yet</h3>
            <p>Enable recording on a stream in the Projects page to get started.</p>
          </div>
        ) : (
          <div className="recordings-grid">
            {filteredRecordings.map((recording) => {
              const { projectName } = parseStreamName(recording.streamName);
              return (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  resolvedProjectName={projectName ? (projectNameMap.get(projectName) ?? projectName) : undefined}
                  onStart={startRecordingSession}
                  onStop={stopRecordingSession}
                  onDelete={handleDeleteRecording}
                  onEditDescription={editDescription}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Recordings;
