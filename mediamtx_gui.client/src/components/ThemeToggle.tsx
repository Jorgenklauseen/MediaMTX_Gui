import { useState, useEffect } from "react";
import {FaMoon, FaSun} from "react-icons/fa";

function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      className="theme-toggle"
    >
      {theme === "dark" ? <FaSun /> : <FaMoon />}
    </button>
  );
}

export default ThemeToggle;
