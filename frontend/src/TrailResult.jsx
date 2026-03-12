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
        <button
          className="login-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const matchingPosts = trails.filter(
    (post) =>
      post.tag &&
      trail.trailTitle &&
      post.tag.toLowerCase().trim() === trail.trailTitle.toLowerCase().trim()
  );

  return (
    <div className="dashboard-page">

      <div className="back-button-container">
        <button
          onClick={() => navigate(-1)}
          className="logout-button"
        >
          ← Back
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-info-section">

          <h1 className="trail-detail-title">
            {trail.trailTitle}
          </h1>

          <p><strong>Region:</strong> {trail.region}</p>
          <p><strong>Difficulty:</strong> {trail.difficulty}</p>
          <p><strong>Time:</strong> {trail.time} hours</p>
          <p><strong>Trip Time:</strong> {trail.tripTime} km</p>
          <p><strong>Elevation Gain:</strong> {trail.elevationGain} m</p>
          <p><strong>Season:</strong> {trail.season}</p>
          <p><strong>Rating:</strong> {trail.rate}</p>

          <p>
            <strong>Dog Friendly:</strong>{" "}
            {trail.dogFriendly ? "Yes" : "No"}
          </p>

          <p>
            <strong>Camping:</strong>{" "}
            {trail.camping ? "Yes" : "No"}
          </p>

          <p>
            <strong>Public Transit:</strong>{" "}
            {trail.publicTransit ? "Yes" : "No"}
          </p>

        </div>
      </div>

      <div className="trail-posts-section">

        <h2>Posts for this Trail</h2>

        {matchingPosts.length === 0 ? (
          <p>No posts yet for this trail.</p>
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