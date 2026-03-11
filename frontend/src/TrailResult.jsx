import { useParams, useNavigate } from "react-router-dom";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/detail.css";

function TrailResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const trail = dataSet.find((t) => t.id === id);

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

    </div>
  );
}

export default TrailResult;