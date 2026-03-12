import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/detail.css";

function TrailResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trails, setTrails] = useState([]);

  const trail = dataSet.find((t) => t.id === id);

  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  if (!trail) {
    return (
      <div className="dashboard-container">
        <h2>Trail Not Found</h2>
        <button className="login-button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const matchingPosts = trails.filter(
    (post) =>
      post.tag &&
      trail.trailTitle &&
      post.tag.toLowerCase().trim() === trail.trailTitle.toLowerCase().trim(),
  );

  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="logout-button">
          ← Back
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-info-section" style={{ width: "100%" }}>
          <h1 className="trail-detail-title">{trail.trailTitle}</h1>

          {/* --- THE NEW 3-COLUMN STATS GRID --- */}
          <div className="trail-stats-grid">
            <div className="stat-box">
              <span className="stat-label">Region</span>
              <span className="stat-value">{trail.region}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Difficulty</span>
              <span className="stat-value">{trail.difficulty}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Time</span>
              <span className="stat-value">{trail.time} hours</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Distance</span>
              <span className="stat-value">{trail.tripTime} km</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Elevation Gain</span>
              <span className="stat-value">{trail.elevationGain} m</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Season</span>
              <span className="stat-value">{trail.season}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Rating</span>
              <span className="stat-value">{trail.rate}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Dog Friendly</span>
              <span className="stat-value">
                {trail.dogFriendly ? "Yes" : "No"}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Camping</span>
              <span className="stat-value">{trail.camping ? "Yes" : "No"}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Public Transit</span>
              <span className="stat-value">
                {trail.publicTransit ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="trail-posts-section">
        <h2>Posts for this Trail</h2>

        {matchingPosts.length === 0 ? (
          <div className="empty-state">
            <p>
              <strong>No posts yet for this trail.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {matchingPosts.map((post) => (
              <div
                key={post._id}
                className="trail-card"
                onClick={() => navigate(`/trail/${post._id}`)}
              >
                {post.imgUrl && <img src={post.imgUrl} alt={post.title} />}
                <div className="trail-info">
                  <h3>{post.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrailResult;
