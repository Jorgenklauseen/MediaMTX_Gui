import { useState } from "react";
import { useRecordings } from "../hooks/useRecordings";
import { useStreams } from "../hooks/useStreams";
import { RecordingCard } from "../components/RecordingCard";
import { RecordingModal } from "../components/RecordingModal";
import { SearchBar } from "../components/SearchBar";
import "../styles/recordings.css";

function Recordings() {
  const { recordings, loading, error, submitRecording, removeRecording, startRecordingSession, stopRecordingSession } = useRecordings();
  const { streams } = useStreams();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRecordings = recordings.filter(recording =>
    recording.name.toLowerCase().includes(search.toLowerCase()) ||
    recording.streamName.toLowerCase().includes(search.toLowerCase()) ||
    recording.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRecording = async (payload: any) => {
    await submitRecording(payload);
  };

  const handleStartRecording = async (id: number) => {
    await startRecordingSession(id);
  };

  const handleStopRecording = async (id: number) => {
    await stopRecordingSession(id);
  };

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
            <p>Create your first recording to get started.</p>
          </div>
        ) : (
          <div className="recordings-grid">
            {filteredRecordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onDelete={handleDeleteRecording}
              />
            ))}
          </div>
        )}
      </div>

      <RecordingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRecording}
        streams={streams.map((stream) => ({ id: stream.id, name: stream.name }))}
      />
    </section>
  );
}

export default Recordings;