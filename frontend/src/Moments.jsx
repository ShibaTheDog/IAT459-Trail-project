import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./stylesheets/dashboard.css";
import "./stylesheets/moments.css";

function Moments() {
  const [trails, setTrails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  const allMoments = trails.filter(
    (trail) => trail.moderationStatus !== "removed"
  );

  return (
    <div className="moments-page-container">
      <div className="moments-page-header">
        <h1>All Moments</h1>
      </div>

      {allMoments.length === 0 ? (
        <div className="empty-state">
          <p>
            <strong>No moments shared yet.</strong>
          </p>
        </div>
      ) : (
        <div className="trails-grid trails-grid-4col">
          {allMoments.map((trail) => {
            const isUnderInvestigation =
              trail.moderationStatus === "under_investigation";
            return (
              <div
                key={trail._id || trail.id}
                className="trail-card"
                onClick={() => navigate(`/trail/${trail._id || trail.id}`)}
              >
                <div className="trail-card-image-wrapper">
                  {trail.imgUrl && trail.imgUrl.trim() !== "" ? (
                    <img
                      src={trail.imgUrl}
                      alt={trail.title}
                      className={isUnderInvestigation ? "trail-card-img-blurred" : ""}
                    />
                  ) : (
                    <div className="no-image-container">No Image</div>
                  )}
                </div>
                <div className="trail-info">
                  <h3>{trail.title}</h3>
                  {trail.user?.username && (
                    <p
                      className="trail-card-username"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user-moments/${trail.user._id || trail.user.id}`);
                      }}
                    >
                      {trail.user.username}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Moments;
