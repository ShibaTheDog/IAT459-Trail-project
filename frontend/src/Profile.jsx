import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/profile.css";

function Profile() {
  const [trails, setTrails] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();
  const { user, logout, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate("/dashboard");
      return;
    }
    
    if (refreshUser) {
      refreshUser();
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
      myTrails.map((post) => post.tag?.toLowerCase().trim()).filter(Boolean)
    ),
  ];

  const trailsVisitedCount = uniqueTrails.length;

  const totalHoursHiked = uniqueTrails.reduce((total, tag) => {
    const matchingTrail = dataSet.find(
      (t) => t.trailTitle?.toLowerCase().trim() === tag
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

  function openDeleteModal() {
    setDeleteError("");
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setDeleteError("");
  }

  async function confirmDeleteAccount() {
    try {
      setDeleteLoading(true);
      setDeleteError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        setDeleteError(data?.error || "Failed to delete account. Please try again.");
        return;
      }

      logout();
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteError("A network error occurred. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="profile-container">
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

          <button className="btn-delete-account" onClick={openDeleteModal}>
            Delete Account
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

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

      <div className="moments-section my-moments">
        {myTrails.length === 0 ? (
          <>
            <h2>My Trail Moment</h2>
            <div className="empty-state">
              <p>
                <strong>No posts created yet. Why not create one?</strong>
              </p>
              <button
                className="create-post-button"
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
                className="create-post-button"
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

      {/* Favorited Trail Moments */}
      <div className="moments-section favorited-moments">
        <h2>Favorited Trail Moments</h2>

        {user.favorites && user.favorites.length > 0 ? (
          <div className="trails-grid">
            {trails
              .filter((trail) =>
                user.favorites.some(
                  (favId) => String(favId) === String(trail._id)
                )
              )
              .map((trail) => (
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
        ) : (
          <div className="empty-state">
            <p>
              <strong>No favorited moments yet. Start exploring trails!</strong>
            </p>
          </div>
        )}
      </div>      

      <div className="bottom-buffer"></div>

      {showDeleteModal && (
        <div className="profile-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h2>Delete Account</h2>
              <button
                className="profile-modal-close"
                onClick={closeDeleteModal}
                type="button"
                disabled={deleteLoading}
              >
                ×
              </button>
            </div>

            <p className="profile-modal-text">
              Are you sure you want to delete your account? This cannot be undone.
            </p>

            {deleteError && (
              <p className="profile-modal-error">{deleteError}</p>
            )}

            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel-button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-modal-delete-button"
                onClick={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;