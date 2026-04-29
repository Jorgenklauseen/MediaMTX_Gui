import { useState } from "react";
import { useRecordings } from "../hooks/useRecordings";
import { useAuth } from "../context/AuthContext";
import { RecordingCard } from "../components/RecordingCard";
import { SearchBar } from "../components/SearchBar";
import type { Recording } from "../types/recordings";
import "../styles/recordings.css";

type GridProps = {
  recordings: Recording[];
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onDelete: (id: number) => void;
  onEditDescription: (id: number, description: string) => Promise<void>;
};

function RecordingGrid({ recordings, onStart, onStop, onDelete, onEditDescription }: GridProps) {
  return (
    <div className="recordings-grid">
      {recordings.map((recording) => (
        <RecordingCard
          key={recording.id}
          recording={recording}
          onStart={onStart}
          onStop={onStop}
          onDelete={onDelete}
          onEditDescription={onEditDescription}
        />
      ))}
    </div>
  );
}

function Recordings() {
  const { recordings, loading, error, removeRecording, startRecordingSession, stopRecordingSession, editDescription } = useRecordings();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");

  const filter = (list: Recording[]) => search.trim()
    ? list.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.streamName.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const myRecordings = recordings.filter(r => !isAdmin || r.createdById === user?.id);
  const otherRecordings = isAdmin ? recordings.filter(r => r.createdById !== user?.id) : [];

  const filteredMine = filter(myRecordings);
  const filteredOther = filter(otherRecordings);

  const handleDeleteRecording = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      await removeRecording(id);
    }
  };

  const gridProps = {
    onStart: startRecordingSession,
    onStop: stopRecordingSession,
    onDelete: handleDeleteRecording,
    onEditDescription: editDescription,
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
        ) : (
          <>
            <section className="recordings-section">
              <div className="recordings-section-header">
                <div>
                  <p className="recordings-section-eyebrow">Overview</p>
                  <h2>My recordings</h2>
                </div>
                <span className="recordings-results-info">
                  {filteredMine.length}{search.trim() ? ` of ${myRecordings.length}` : ""} recordings
                </span>
              </div>

              {myRecordings.length === 0 ? (
                <div className="recordings-state-card">
                  <h3>No recordings yet</h3>
                  <p>Enable recording on a stream in the Projects page to get started.</p>
                </div>
              ) : (
                <RecordingGrid recordings={filteredMine} {...gridProps} />
              )}
            </section>

            {isAdmin && otherRecordings.length > 0 && (
              <section className="recordings-section">
                <div className="recordings-section-header">
                  <div>
                    <p className="recordings-section-eyebrow">Admin access</p>
                    <h2>All other recordings</h2>
                  </div>
                  <span className="recordings-results-info">
                    {filteredOther.length}{search.trim() ? ` of ${otherRecordings.length}` : ""} recordings
                  </span>
                </div>
                <RecordingGrid recordings={filteredOther} {...gridProps} />
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Recordings;
