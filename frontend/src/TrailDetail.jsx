import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./stylesheets/detail.css";

function TrailDetail() {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/trails/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch trail details");
        }
        return res.json();
      })
      .then((data) => setTrail(data))
      .catch((err) => {
        console.error("Error fetching trail:", err);
        setError("Could not load the trail details. Please try again.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="dashboard-container">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="login-button">
          Go Back
        </button>
      </div>
    );
  }

  if (!trail) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="logout-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-image-section">
          <img
            src={trail.imgUrl}
            alt={trail.title}
            className="trail-detail-image"
          />
        </div>

        <div className="trail-detail-info-section">
          <h1 className="trail-detail-title">{trail.title}</h1>
          <p className="trail-detail-description">{trail.description}</p>

          {trail.tag && <div className="trail-detail-tag">{trail.tag}</div>}
        </div>
      </div>
    </div>
  );
}

export default TrailDetail;
