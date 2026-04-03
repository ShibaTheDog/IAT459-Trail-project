import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/profile.css";

function Profile() {
  const [trails, setTrails] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate("/dashboard");
      return;
    }
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, [user, navigate]);

  const myTrails = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId === loggedInUserId;
      })
    : [];

  const uniqueTrails = [
    ...new Set(
      myTrails.map((post) => post.tag?.toLowerCase().trim()).filter(Boolean),
    ),
  ];

  const trailsVisitedCount = uniqueTrails.length;

  const totalHoursHiked = uniqueTrails.reduce((total, tag) => {
    const matchingTrail = dataSet.find(
      (t) => t.trailTitle?.toLowerCase().trim() === tag,
    );
    if (matchingTrail && matchingTrail.time) {
      return total + parseFloat(matchingTrail.time);
    }
    return total;
  }, 0);

  function handleLogout() {
    logout();
    navigate("/dashboard");
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete account. Please try again.");
        return;
      }

      logout();
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete account error:", err);
      alert("A network error occurred. Please try again.");
    }
  }

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Top nav */}
      <div className="profile-nav">
        <button
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          &#8592; Back
        </button>
        <div className="profile-nav-actions">
          {user.role === "admin" && (
            <button
              className="btn-admin"
              onClick={() => navigate("/admin/moderation")}
            >
              Admin Moderation
            </button>
          )}
          <button className="btn-delete-account" onClick={handleDeleteAccount}>
            Delete Account
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Profile section */}
      <div className="profile-section">
        <div className="profile-avatar-large">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2 className="profile-username">
            {user.username}
            <span className="profile-role-badge">({user.role})</span>
          </h2>
          <div className="profile-stats">
            <div className="profile-stat-item">
              <span className="profile-stat-number">{trailsVisitedCount}</span>
              <span className="profile-stat-label">Trails Visited</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-number">{myTrails.length}</span>
              <span className="profile-stat-label">Trail Moments</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-number">{totalHoursHiked}</span>
              <span className="profile-stat-label">Hours Hiked</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Trail Moment */}
      <div className="moments-section my-moments">
        {myTrails.length === 0 ? (
          <>
            <h2>My Trail Moment</h2>
            <div className="empty-state">
              <p>
                <strong>No posts created yet. Why not create one?</strong>
              </p>
              <button
                className="login-button"
                onClick={() => navigate("/create-post")}
              >
                Create post
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="section-header-row">
              <h2>My Trail Moment</h2>
              <button
                className="login-button"
                onClick={() => navigate("/create-post")}
              >
                Create post
              </button>
            </div>
            <div className="trails-grid">
              {myTrails.map((trail) => (
                <div
                  key={trail._id || trail.id}
                  className="trail-card"
                  onClick={() => navigate(`/trail/${trail._id || trail.id}`)}
                >
                  {trail.imgUrl && trail.imgUrl.trim() !== "" ? (
                    <img src={trail.imgUrl} alt={trail.title} />
                  ) : (
                    <div className="no-image-container">No Image</div>
                  )}
                  <div className="trail-info">
                    <h3>{trail.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bottom-buffer"></div>
    </div>
  );
}

export default Profile;
