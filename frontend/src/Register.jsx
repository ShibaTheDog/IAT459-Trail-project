// handles user registration

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./stylesheets/main.css";
import "./stylesheets/authentication.css";

import hikingHero from "./assets/hiking-hero.png";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // sends post request to back end, with success and error depending on duplicant, and sending to login screen
  const handleRegister = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Expected JSON but got: ${text.substring(0, 120)}`
      );
    }

    const data = await res.json();

    if (res.ok) {
      setSuccess("Registration successful! Please log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      setError(data.message || data.error || "Registration failed");
    }
  } catch (err) {
    console.error(err);
    setError(err.message || "An error occurred. Please try again.");
  }
};

  // visual UI for registration page
  return (
    <div className="auth-page-container">
      <div className="auth-hero-img-container">
        <img
          src={hikingHero}
          alt="Hikers on a hiking trail"
          className="auth-hero-img"
        ></img>
      </div>

      <div className="auth-container">
        <div className="auth-form-container-content">
          <div className="auth-header">
            <h1>Welcome to TrailTracker</h1>
            <p>Create an account to explore Vancouver hiking trail</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Choose an email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="button-primary">
              Create Account
            </button>

            <Link to="/login" className="button-secondary">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
