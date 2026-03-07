import { useContext, useEffect, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    imgUrl: "",
  });

  const navigate = useNavigate();

  const { token, user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to post trail. Are you authorized?");
      }

      const newTrail = await response.json();

      setTrails([...trails, newTrail]);

      // Clear the form
      setFormData({
        title: "",
        description: "",
        tag: "",
        imgUrl: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {user ? (
          <>
            <h1> Welcome {user.username}</h1>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <h1> Welcome to TrailTracker</h1>
        )}
      </header>

      {!user && (
        <div className="dashboard-banner">
          <p>
            <strong>You must login or create an account to make a post</strong>
          </p>
          <button className="login-button" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      )}

      <div className="trail-form-section">
        <div className="image-droparea">
          <p>Drag an image here</p>
          <input
            type="text"
            name="imgUrl"
            placeholder="Paste Image URL..."
            value={formData.imgUrl}
            onChange={handleChange}
            disabled={!user}
            className="url-input"
          />
        </div>

        <form className="trai-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="Add a title"
              value={formData.title}
              onChange={handleChange}
              disabled={!user}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <input
              name="description"
              placeholder="Add a description"
              value={formData.description}
              onChange={handleChange}
              disabled={!user}
              rows="4"
              required
            />
          </div>

          <div className="input-group">
            <label>Tag</label>
            <input
              name="tag"
              placeholder="Add taggs"
              value={formData.tag}
              onChange={handleChange}
              disabled={!user}
            />
          </div>

          <button type="submit" className="subtmit=button" disabled={!user}>
            Submit
          </button>
        </form>
      </div>

      <div className="moments-section">
        <h2>My Trail Moment</h2>

        {trails.length === 0 ? (
          <div className="empty-state">
            <p>
              <strong>
                No posts created yet. Why not create a post while your at it?
              </strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {trails.map((trail) => (
              <div key={trail.id} className="trail-card">
                {trail.imgUrl && <img src={trail.imgUrl} alt={trail.title} />}
                <div className="trail-info">
                  <h3>{trail.title}</h3>
                  <p>{trail.description}</p>
                  <span className="trail-tag">{trail.tag}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
