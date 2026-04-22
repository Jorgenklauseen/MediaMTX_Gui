import type { User } from "../types/users";
import { getInitials, formatDate } from "../utils";
import "../styles/users.css";

interface UserCardProps {
  user: User;
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
}


export function UserCard({ user, onBan, onUnban }: UserCardProps) {
  return (
    <div className="user-card">
      <div className="user-card__header">
        <div className="user-card__avatar">{getInitials(user.name)}</div>
        <div>
          <p className="user-card__name">{user.name}</p>
          <p className="user-card__username">@{user.username}</p>
        </div>
      </div>

      <hr className="user-card__divider" />

      <div className="user-card__meta">
        <div>
          <div className="user-card__label">Email</div>
          <div className="user-card__value">{user.email}</div>
        </div>
        <div>
          <div className="user-card__label">Last Login</div>
          <div className="user-card__value">{formatDate(user.lastLogin)}</div>
        </div>
        <div>
          <div className="user-card__label">Created</div>
          <div className="user-card__value">{formatDate(user.createdAt)}</div>
        </div>
        <div>
          <div className="user-card__label">Role</div>
          <div className="user-card__value">{user.role}</div>
        </div>
      </div>

      <hr className="user-card__divider" />

      <div className="user-card__footer">
        <span
          className={`badge ${user.isBanned ? "badge--banned" : "badge--active"}`}
        >
          {user.isBanned ? "🚫 Banned" : "✅ Active"}
        </span>
        {user.isBanned ? (
          <button
            className="user-card__btn user-card__btn--unban"
            onClick={() => onUnban(user.id)}
          >
            Unban
          </button>
        ) : (
          <button
            className="user-card__btn user-card__btn--ban"
            onClick={() => onBan(user.id)}
          >
            Ban
          </button>
        )}
      </div>
    </div>
  );
}


