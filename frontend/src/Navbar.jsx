import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/navbar.css";

function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="global-navbar">
      <span className="global-navbar-logo" onClick={() => navigate("/dashboard")}>
        TrailTracker
      </span>

      {user ? (
        <div
          className="profile-avatar global-navbar-avatar"
          onClick={() => navigate("/profile")}
          title="View Profile"
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="header-buttons">
          <button className="button-outline" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="button-primary" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
