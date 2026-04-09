// this page is to showcase posts from a single user, based off Moments

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./stylesheets/dashboard.css";
import "./stylesheets/moments.css";

function UserMoments() {
  const [trails, setTrails] = useState([]);
  const navigate = useNavigate();
  const { userId } = useParams();

  // first retrieves all posts
  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  // filter posts so they dont show deleted posts, and filter to only show posts of selected user
  const userMoments = trails.filter(
    (trail) =>
      trail.moderationStatus !== "removed" &&
      trail.user?._id === userId
  );

  // retrieves username for header
  const username =
    trails.find((t) => t.user?._id === userId)?.user?.username || "User";

  // visual UI of userMoments
  return (
    <div className="moments-page-container">
      <div className="moments-back-row">
        <button className="profile-back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="moments-page-header">
        <h1>{username}'s Moments</h1>
      </div>

      {userMoments.length === 0 ? (
        <div className="empty-state">
          <p>
            <strong>No moments from this user yet.</strong>
          </p>
        </div>
      ) : (
        <div className="trails-grid trails-grid-4col">
          {userMoments.map((trail) => {
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
                    <p className="trail-card-username">
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

export default UserMoments;
