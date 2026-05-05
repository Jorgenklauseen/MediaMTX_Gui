import { NavLink } from "react-router";
/* import { LogoutButton } from "../components/LogoutButton"; */
import "../index.css";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      {isAuthenticated && (
        <ul className="navbar__links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/recordings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Recordings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/projects"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/guides"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Guide
            </NavLink>
          </li>
          {user?.role === "admin" && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Users
              </NavLink>
            </li>
          )}
        </ul>
      )}
      <div className="navbar__actions">
        {isAuthenticated
          ? <UserMenu />
          : <a className="navbar__logout" href="/api/users/login?returnUrl=/dashboard">Log in</a>
        }
        <ThemeToggle />
      </div>
    </nav>
  );
}
