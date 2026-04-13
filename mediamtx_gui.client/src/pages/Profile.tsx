import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteCurrentUser } from "../api/usersApi";
import { getProjects } from "../api/projectsApi";
import { getInitials } from "../utils";
import type { Project } from "../types/projects";
import "../styles/profile.css";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone.",
      )
    )
      return;
    try {
      await deleteCurrentUser();
      window.location.href = "/api/users/logout";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{getInitials(user.name)}</div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-username">@{user.username}</p>

        <div className="profile-meta">
          <div className="profile-meta-row">
            <span className="profile-meta-label">Email</span>
            <span className="profile-meta-value">{user.email}</span>
          </div>
          <div className="profile-meta-row">
            <span className="profile-meta-label">Role</span>
            <span className="profile-meta-value">{user.role}</span>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="profile-projects">
            <h3 className="profile-section-title">Your projects</h3>
            <ul className="profile-project-list">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="profile-project-item"
                  onClick={() => navigate("/projects")}
                >
                  <span className="profile-project-name">{project.name}</span>
                  <span className="profile-project-role">{project.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="profile-danger-zone">
          <h3>Danger zone</h3>
          <p>Deleting your account is permanent and cannot be undone.</p>
          <button
            className="profile-delete-btn"
            onClick={() => void handleDeleteAccount()}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
