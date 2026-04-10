import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "../utils";

export function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="navbar__avatar" onClick={() => setOpen((v) => !v)}>
        {getInitials(user.name)}
      </button>

      {open && (
        <div className="user-menu__dropdown">
          <div className="user-menu__header">
            <p className="user-menu__name">{user.name}</p>
            <p className="user-menu__email">{user.email}</p>
          </div>
          <button
            className="user-menu__item"
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
          >
            Profile
          </button>
          <button
            className="user-menu__item user-menu__item--danger"
            onClick={() => (window.location.href = "/api/users/logout")}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
