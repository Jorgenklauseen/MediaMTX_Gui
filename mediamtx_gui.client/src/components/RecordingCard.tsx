import { useState } from "react";
import type { Recording, RecordingFile } from "../types/recordings";
import { getRecordingFiles } from "../api/recordingsApi";
import { parseStreamName, formatDate, formatTimeOfDay } from "../utils";
import "../styles/recordings.css";

interface RecordingCardProps {
    recording: Recording;
    onStart?: (id: number) => void;
    onStop?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEditDescription?: (id: number, description: string) => Promise<void>;
}

export function RecordingCard({ recording, onStart, onStop, onDelete, onEditDescription }: RecordingCardProps) {
    const { streamName, projectName } = parseStreamName(recording.streamName);
    const [files, setFiles] = useState<RecordingFile[] | null>(null);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [filesError, setFilesError] = useState<string | null>(null);

    const [previewAvailable, setPreviewAvailable] = useState(true);

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(recording.description);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const formatDuration = (duration: string) => {
        const match = duration.match(/^(\d+):(\d{2}):(\d{2})/);
        if (!match) return duration;
        const [, h, m, s] = match;
        if (parseInt(h) > 0) return `${h}h ${m}m ${s}s`;
        if (parseInt(m) > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    const handleLoadFiles = async () => {
        try {
            setLoadingFiles(true);
            setFilesError(null);
            const result = await getRecordingFiles(recording.id);
            setFiles(result);
        } catch {
            setFilesError("Could not load files. They may have been auto-deleted after 1 day.");
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleSaveDescription = async () => {
        if (!onEditDescription) return;
        try {
            setSaving(true);
            setSaveError(null);
            await onEditDescription(recording.id, draft);
            setEditing(false);
        } catch {
            setSaveError("Could not save description.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setDraft(recording.description);
        setSaveError(null);
        setEditing(false);
    };

    return (
        <div className="recording-card">
            <div className="recording-card__header">
                <h3 className="recording-card__title">{recording.name}</h3>
                <span className={`recording-card__status recording-card__status--${recording.status}`}>
                    {recording.status}
                </span>
            </div>

            {!editing ? (
                <div className="recording-card__description-row">
                    <p className="recording-card__description">
                        {recording.description
                            ? recording.description
                            : <span className="recording-card__description--empty">No description</span>}
                    </p>
                    {onEditDescription && (
                        <button
                            className="recording-card__edit-btn"
                            onClick={() => { setDraft(recording.description); setEditing(true); }}
                            title="Edit description"
                        >
                            Edit
                        </button>
                    )}
                </div>
            ) : (
                <div className="recording-card__edit-form">
                    <textarea
                        className="recording-card__edit-textarea"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Add a description..."
                        rows={3}
                        disabled={saving}
                    />
                    {saveError && <p className="recording-card__files-error">{saveError}</p>}
                    <div className="recording-card__edit-actions">
                        <button
                            className="recording-card__btn recording-card__btn--save"
                            onClick={() => void handleSaveDescription()}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                            className="recording-card__btn recording-card__btn--cancel"
                            onClick={handleCancelEdit}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {recording.status === "completed" && previewAvailable && (
                <video
                    className="recording-card__preview"
                    src={`/api/recordings/${recording.id}/preview`}
                    preload="metadata"
                    controls
                    onError={() => setPreviewAvailable(false)}
                />
            )}

            <div className="recording-card__meta">
                {projectName && <p className="recording-card__stream">{projectName}</p>}
                <p className="recording-card__stream">{streamName}</p>
                <p className="recording-card__created">
                    Created: {formatDate(recording.createdAt)}
                </p>
                {recording.startedAt && (
                    <p className="recording-card__created">
                        Started: {formatTimeOfDay(recording.startedAt)}
                    </p>
                )}
                {recording.duration && recording.duration !== "00:00:00" && (
                    <p className="recording-card__duration">
                        Duration: {formatDuration(recording.duration)}
                    </p>
                )}
                {recording.fileSize > 0 && (
                    <p className="recording-card__size">
                        Total size: {formatFileSize(recording.fileSize)}
                    </p>
                )}
            </div>

            <div className="recording-card__actions">
                {recording.status === "pending" && onStart && (
                    <button
                        onClick={() => onStart(recording.id)}
                        className="recording-card__btn recording-card__btn--start"
                    >
                        Start Recording
                    </button>
                )}
                {recording.status === "recording" && onStop && (
                    <button
                        onClick={() => onStop(recording.id)}
                        className="recording-card__btn recording-card__btn--stop"
                    >
                        Stop Recording
                    </button>
                )}
                {recording.status === "completed" && !files && (
                    <button
                        onClick={() => void handleLoadFiles()}
                        className="recording-card__btn recording-card__btn--files"
                        disabled={loadingFiles}
                    >
                        {loadingFiles ? "Loading..." : "View download file"}
                    </button>
                )}
                {recording.status === "completed" && files && (
                    <button
                        onClick={() => setFiles(null)}
                        className="recording-card__btn recording-card__btn--files"
                    >
                        Hide download file
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(recording.id)}
                        className="recording-card__btn recording-card__btn--delete"
                    >
                        Delete
                    </button>
                )}
            </div>

            {filesError && (
                <p className="recording-card__files-error">{filesError}</p>
            )}

            {files !== null && (
                <div className="recording-card__files">
                    {files.length === 0 ? (
                        <p className="recording-card__files-empty">
                            No segment files found. They may have been auto-deleted.
                        </p>
                    ) : (
                        <ul className="recording-card__file-list">
                            {files.map((file) => (
                                <li key={file.name} className="recording-card__file-item">
                                    <span className="recording-card__file-name">{file.name}</span>
                                    <span className="recording-card__file-size">{formatFileSize(file.size)}</span>
                                    <a
                                        href={file.url}
                                        download={file.name}
                                        className="recording-card__btn recording-card__btn--download"
                                    >
                                        Download
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
