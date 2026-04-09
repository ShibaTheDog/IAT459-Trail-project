// desplays information on a specific trail, and related user posts of that trail

import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/detail.css";

function TrailResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [trails, setTrails] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // find trail data from local dataset in assets
  const trail = dataSet.find((t) => t.id === id);

  // fetch all posts of the trail in backend
  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  // checks for users profile 
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

  // checks favorited post
  function isFavoritedByCurrentUser(post) {
    if (!currentUserProfile || !Array.isArray(currentUserProfile.favorites)) {
      return false;
    }

    return currentUserProfile.favorites.some((favoriteTrail) => {
      const favoriteTrailId = favoriteTrail?._id || favoriteTrail;
      return String(favoriteTrailId) === String(post._id || post.id);
    });
  }

  // checks if there is not trail, returning back to dashboard
  if (!trail) {
    return (
      <div className="dashboard-container">
        <h2>Trail Not Found</h2>
        <button
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          &#8592; Back
        </button>
      </div>
    );
  }

  // what filters posts of this trail
  const matchingPosts = trails.filter(
    (post) =>
      post.tag &&
      trail.trailTitle &&
      post.tag.toLowerCase().trim() === trail.trailTitle.toLowerCase().trim()
  );

  // visual UI for trails
  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="profile-back-button">
          &#8592; Back
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-info-section trail-result-full-width">
          <h1 className="trail-detail-title">{trail.trailTitle}</h1>

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
        <div className="section-header-row">
          <h2>Posts for this Trail</h2>
          <button
            className="create-post-button"
            onClick={() =>
              navigate("/create-post", {
                state: { preselectedTrail: trail.trailTitle },
              })
            }
          >
            Create Post
          </button>
        </div>

        {matchingPosts.length === 0 ? (
          <div className="empty-state">
            <p>
              <strong>No posts yet for this trail.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {matchingPosts.map((post) => {
              const isUnderInvestigation =
                post.moderationStatus === "under_investigation";

              return (
                <div
                  key={post._id}
                  className="trail-card"
                  onClick={() => navigate(`/trail/${post._id}`)}
                >
                  <div className="trail-card-image-wrapper">
                    {post.imgUrl ? (
                      <img
                        src={post.imgUrl}
                        alt={post.title}
                        className={
                          isUnderInvestigation ? "trail-card-img-blurred" : ""
                        }
                      />
                    ) : (
                      <div className="no-image-container">No Image</div>
                    )}
                  </div>

                  <div className="trail-info">
                    <div className="trail-card-title-row">
                      <h3>{post.title}</h3>

                      {isFavoritedByCurrentUser(post) && (
                        <span className="trail-favorite-badge" title="Favorited">
                          ★
                        </span>
                      )}
                    </div>

                    {(post.user?.username || isUnderInvestigation) && (
                      <div className="trail-card-meta-row">
                        {post.user?.username && (
                          <p
                            className="trail-card-username"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user-moments/${post.user?._id}`);
                            }}
                          >
                            {post.user.username}
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
    </div>
  );
}

export default TrailResult;