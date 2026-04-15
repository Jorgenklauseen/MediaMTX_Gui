import type { Recording } from "../types/recordings";
import "../styles/recordings.css";

interface RecordingCardProps {
    recording: Recording;
    onStart?: (id: number) => void;
    onStop?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export function RecordingCard({ recording, onStart, onStop, onDelete }: RecordingCardProps) {
    const formatDuration = (duration: string) => {
        // Parse ISO 8601 duration and format nicely
        return duration;
    };

    const formatFileSize = (bytes: number) => {
        // Format bytes to human readable
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div className="recording-card">
            <div className="recording-card__header">
                <h3 className="recording-card__title">{recording.name}</h3>
                <span className={`recording-card__status recording-card__status--${recording.status}`}>
                    {recording.status}
                </span>
            </div>

            <div className="recording-card__meta">
                <p className="recording-card__stream">Stream: {recording.streamName}</p>
                <p className="recording-card__created">Created: {new Date(recording.createdAt).toLocaleDateString()}</p>
                {recording.duration && <p className="recording-card__duration">Duration: {formatDuration(recording.duration)}</p>}
                {recording.fileSize > 0 && <p className="recording-card__size">Size: {formatFileSize(recording.fileSize)}</p>}
            </div>

            <div className="recording-card__actions">
                {recording.status === 'pending' && onStart && (
                    <button onClick={() => onStart(recording.id)} className="recording-card__btn recording-card__btn--start">
                        Start Recording
                    </button>
                )}
                {recording.status === 'recording' && onStop && (
                    <button onClick={() => onStop(recording.id)} className="recording-card__btn recording-card__btn--stop">
                        Stop Recording
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(recording.id)} className="recording-card__btn recording-card__btn--delete">
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}