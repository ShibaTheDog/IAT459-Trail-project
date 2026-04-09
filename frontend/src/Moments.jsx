// this is to showcase all the user posts on a single page not on dashboard highlihgt section

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/dashboard.css";
import "./stylesheets/moments.css";

function Moments() {
  const [trails, setTrails] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  // fetch all trails on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  // fetch user loged in profile with token
  useEffect(() => {
    if (!user || !token) {
      setCurrentUserProfile(null);
      return;
    }

    fetch("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserProfile(data.user))
      .catch((err) => {
        console.error("Error fetching current user profile:", err);
        setCurrentUserProfile(null);
      });
  }, [user, token]);

  // check if a trail is facorited by current user
  function isFavoritedByCurrentUser(trail) {
    if (!currentUserProfile || !Array.isArray(currentUserProfile.favorites)) {
      return false;
    }

    return currentUserProfile.favorites.some((favoriteTrail) => {
      const favoriteTrailId = favoriteTrail?._id || favoriteTrail;
      return String(favoriteTrailId) === String(trail._id || trail.id);
    });
  }

  // filter out trails marked as removed, not showing them in the UI
  const allMoments = trails.filter(
    (trail) => trail.moderationStatus !== "removed"
  );

  // the visual UI of all moments
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
                className="trail-card trail-card-moments"
                onClick={() => navigate(`/trail/${trail._id || trail.id}`)}
              >
                <div className="trail-card-image-wrapper">
                  {trail.imgUrl && trail.imgUrl.trim() !== "" ? (
                    <img
                      src={trail.imgUrl}
                      alt={trail.title}
                      className={`trail-card-img ${
                        isUnderInvestigation ? "trail-card-img-blurred" : ""
                      }`}
                    />
                  ) : (
                    <div className="no-image-container trail-card-no-image">
                      No Image
                    </div>
                  )}
                </div>

                <div className="trail-info">
                  <div className="trail-card-title-row">
                    <h3>{trail.title}</h3>

                    {isFavoritedByCurrentUser(trail) && (
                      <span className="trail-favorite-badge" title="Favorited">
                        ★
                      </span>
                    )}
                  </div>

                  {(trail.user?.username || isUnderInvestigation) && (
                    <div className="trail-card-meta-row">
                      {trail.user?.username && (
                        <p
                          className="trail-card-username"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/user-moments/${trail.user._id || trail.user.id}`
                            );
                          }}
                        >
                          {trail.user.username}
                        </p>
                      )}

                      {isUnderInvestigation && (
                        <span className="trail-card-investigation-badge">
                          Under Investigation
                        </span>
                      )}
                    </div>
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