import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import "./stylesheets/main.css";
import "./stylesheets/authentication.css";

import Register from "./Register";

import hikingHero from "./assets/hiking-hero.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

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

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
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
              Login
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
