import { NavLink } from "react-router";
import reactLogo from "../assets/react.svg";
import "../index.css";
import ToggleTheme from "../components/ThemeToggle";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src={reactLogo} alt="React Logo" className="navbar__logo-image" />
      </div>
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
      </ul>
      <ToggleTheme />
    </nav>
  );
}
export default Navbar;
