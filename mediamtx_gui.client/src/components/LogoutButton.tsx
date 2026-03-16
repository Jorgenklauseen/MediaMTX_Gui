import { useAuth } from "../context/AuthContext";

export function LogoutButton() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/users/logout";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="navbar__user">
        Hello, {user?.name || user?.username}
      </span>
      <button className="navbar__logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

