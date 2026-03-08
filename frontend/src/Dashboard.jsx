import { useContext, useEffect, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const navigate = useNavigate();
  const { token, user, logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    imgUrl: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, [token, navigate]);

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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to post trail");
    }

    console.log("POST SUCCESS:", data);

    // Add the new post to the UI
    setTrails([...trails, data]);

    // Show confirmation
    alert("Trail successfully posted!");

    // Clear the form
    setFormData({
      title: "",
      description: "",
      tag: "",
      imgUrl: "",
    });

  } catch (err) {
    console.error("POST ERROR:", err);
    alert(err.message);
  }
}

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {user ? (
          <>
            <h1>Welcome {user.username}</h1>
            <button
              className="logout-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : null}
      </header>

      <div className="trail-form-section">
        <div className="image-droparea">
          <p>Drag an image here</p>
          <input
            type="text"
            name="imgUrl"
            placeholder="Paste Image URL..."
            value={formData.imgUrl}
            onChange={handleChange}
            className="url-input"
          />
        </div>

        <form className="trail-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="Add a title"
              value={formData.title}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="input-group">
            <label>Tag</label>
            <input
              name="tag"
              placeholder="Add tags"
              value={formData.tag}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>

      <div className="statistics-section">
        <h2>My Statistics</h2>

        {!user ? (
          <div className="empty-state">
            <p>
              <strong>No posts created yet.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {trails.map((trail) => (
              <div key={trail._id} className="trail-card">
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