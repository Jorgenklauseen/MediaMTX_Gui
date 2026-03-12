import { NavLink } from "react-router";
import LogoutButton from "./LogoutButton";
import "../index.css";
import ToggleTheme from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      {/*   <div className="navbar__logo">
        <img src={uiaLogo} alt="UIA Logo" className="navbar__logo-image" />
      </div> */}
      <ul className="navbar__links">
        <li>
          <NavLink
            to="/"
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
      <div className="navbar__actions">
        <LogoutButton />
        <ToggleTheme />
      </div>
    </nav>
  );
}
export default Navbar;
