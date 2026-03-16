import { useEffect } from "react";
import type { User } from "../types/users";
import { UserCard } from "./UserCard";

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
}

export function UserModal({ user, onClose, onBan, onUnban }: UserModalProps) {
  useEffect(() => {
    if (!user) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  if (!user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Lukk">
          ✕
        </button>
        <UserCard user={user} onBan={onBan} onUnban={onUnban} />
      </div>
    </div>
  );
}
