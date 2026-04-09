// sets up what the global navigation bar across different pages in the app

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/navbar.css";

function Navbar() {
  // gets current user from auth
  const { user } = useContext(AuthContext);
  // routing for between pages
  const navigate = useNavigate();

  // sets up how teh UI actually looks
  return (
    <nav className="global-navbar">
      <span className="global-navbar-logo" onClick={() => navigate("/dashboard")}>
        TrailTracker
      </span>

      <div className="global-navbar-right">
        <span className="global-navbar-link" onClick={() => navigate("/moments")}>
          Moments
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
      </div>
    </nav>
  );
}

export default Navbar;
