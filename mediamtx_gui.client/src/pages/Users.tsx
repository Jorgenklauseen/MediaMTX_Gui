import { useState, useMemo } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserModal } from "../components/UserModal";
import { SearchBar } from "../components/SearchBar";
import { getInitials, formatDate } from "../utils";
import "../styles/users.css";




type StatusFilter = "alle" | "aktiv" | "bannet";

export function Users() {
  const { users, loading, error, banUser, unbanUser } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "alle" ||
        (statusFilter === "bannet" && u.isBanned) ||
        (statusFilter === "aktiv" && !u.isBanned);
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  if (loading)
    return (
      <div className="users-page">
        <p>Loading users...</p>
      </div>
    );
  if (error)
    return (
      <div className="users-page">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <p className="users-eyebrow">Administration</p>
          <h1>Users</h1>
        </div>
      </div>

      <div className="users-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or username..."
        />

        <div className="users-status-filter">
          {(["alle", "aktiv", "bannet"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              data-status={s}
              className={`users-status-filter__btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "alle" ? "All" : s === "aktiv" ? "Active" : "Banned"}
            </button>
          ))}
        </div>
      </div>
      <div className="users-results-info">
        {filtered.length} of {users.length} users
      </div>
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="users-table__empty">
                  No users match the search
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="users-table__row"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <td>
                    <div className="users-table__user-cell">
                      <div className="users-table__avatar">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="users-table__name">{user.name}</div>
                        <div className="users-table__username">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="users-table__email">{user.email}</td>
                  <td>
                    <span className={`role-badge role-badge--${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="users-table__muted">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td>
                    <span
                      className={`badge ${user.isBanned ? "badge--banned" : "badge--active"}`}
                    >
                      {user.isBanned ? "🚫 Banned" : "✅ Active"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        user={selectedUser}
        onClose={() => setSelectedUserId(null)}
        onBan={banUser}
        onUnban={unbanUser}
      />
    </div>
  );
}

export default Users;
