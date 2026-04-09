import { useState } from "react";
import type { CreateRecordingPayload } from "../types/recordings";
import "../styles/recordings.css";

interface RecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateRecordingPayload) => Promise<void>;
    streams: Array<{ id: number; name: string }>;
}

export function RecordingModal({ isOpen, onClose, onSubmit, streams }: RecordingModalProps) {
    const [formData, setFormData] = useState<CreateRecordingPayload>({
        name: "",
        description: "",
        streamId: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({ name: "", description: "", streamId: 0 });
            onClose();
        } catch (err) {
            // Error handled by hook
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="recording-modal">
            <div className="recording-modal__overlay" onClick={onClose} />
            <div className="recording-modal__content">
                <h2 className="recording-modal__title">Create New Recording</h2>

                <form onSubmit={handleSubmit} className="recording-modal__form">
                    <div className="recording-modal__field">
                        <label htmlFor="name" className="recording-modal__label">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="recording-modal__input"
                            required
                        />
                    </div>

                    <div className="recording-modal__field">
                        <label htmlFor="description" className="recording-modal__label">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="recording-modal__textarea"
                        />
                    </div>

                    <div className="recording-modal__field">
                        <label htmlFor="streamId" className="recording-modal__label">Stream</label>
                        <select
                            id="streamId"
                            value={formData.streamId}
                            onChange={(e) => setFormData(prev => ({ ...prev, streamId: parseInt(e.target.value) }))}
                            className="recording-modal__select"
                            required
                        >
                            <option value={0}>Select a stream</option>
                            {streams.map(stream => (
                                <option key={stream.id} value={stream.id}>{stream.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="recording-modal__actions">
                        <button type="button" onClick={onClose} className="recording-modal__btn recording-modal__btn--cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="recording-modal__btn recording-modal__btn--submit">
                            {submitting ? "Creating..." : "Create Recording"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}