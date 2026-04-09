// page for user authentication

import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import "./stylesheets/main.css";
import "./stylesheets/authentication.css";

import Register from "./Register";

import hikingHero from "./assets/hiking-hero.png";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  // handles login, storing token if succeful, error if not, and redirecting to dashboard
 async function handleLogin(e) {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 120)}`);
    }

    const data = await res.json();

    if (res.ok) {
      login(data.token);
      navigate("/dashboard");
    } else {
      setError(data.error || data.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
    setError(err.message || "An error occurred. Please try again later.");
  }
}

  // UI visualizaiton of login screen
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
            <h1>Welcome back</h1>
            <p>Login to explore Vancouver hiking trail</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              id="identifier"
              placeholder="Enter email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
              Login
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/Dashboard")}
            >
              Continue as Guest
            </button>
          </div>

          <div className="auth-regristration-link">
            <p className="auth-regristration-text">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
