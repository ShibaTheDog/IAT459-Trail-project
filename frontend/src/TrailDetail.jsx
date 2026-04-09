// to view a single detailed post

import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { dataSet } from "./assets/dataSet";
import "./stylesheets/detail.css";

function TrailDetail() {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState("owner");
  const [deleteError, setDeleteError] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [reportReason, setReportReason] = useState("offensive");
  const [reportMessage, setReportMessage] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const navigate = useNavigate();
  const { token, user, refreshUser } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch trail detail on mount and id change
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
        setPageError("Could not load the trail details. Please try again.");
      });
  }, [id]);

  // refreshes page and updates UI for favoriting post 
  useEffect(() => {
    if (user && refreshUser) {
      refreshUser();
    }
  }, [id, user, refreshUser]); 

  // checks if user favorites the post (which then causes refreshUser trigger)
  useEffect(() => {
    if (!trail || !user) return;
    const favorited = (user.favorites || []).some((fav) => {
      const favId = typeof fav === "string" ? fav : fav._id;
      return String(favId) === String(trail._id);
    });
    setIsFavorited(favorited);
  }, [trail, user]);

  // admin fucntion to delete trail directly, needs proper token to do so
  async function handleAdminDelete() {
    const confirmDelete = window.confirm(
      "Admin: Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/trails/admin/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete trail");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Admin delete error:", err);
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }
  
  // open the delete dropdown for admin or owner of post
  function openDeleteModal(mode) {
    setDeleteMode(mode);
    setDeleteError("");
    setShowDeleteModal(true);
  }

  // close the delete section for admin or owner of post
  function closeDeleteModal() {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setDeleteError("");
  }

  // confirm delete action
  async function confirmDelete() {
    try {
      setDeleteLoading(true);
      setDeleteError("");

      const endpoint =
        deleteMode === "admin"
          ? `http://localhost:5000/api/trails/admin/${id}`
          : `http://localhost:5000/api/trails/${id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete trail");
      }

      closeDeleteModal();
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete trail");
    } finally {
      setDeleteLoading(false);
    }
  }

  // toggle favorite/unfavorite post
  async function handleFavoriteToggle() {
    if (!user) {
      navigate("/login");
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/trails/${id}/favorite`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to favorite");

      await refreshUser();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setFavoriteLoading(false);
    }
  }

  // open report dashboard
  function openReportModal() {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (hasUserReported) {
      setReportError("You have already reported this post.");
      setReportSuccess("");
      return;
    }

    setReportError("");
    setReportSuccess("");
    setShowReportModal(true);
  }

  // close report
  function closeReportModal() {
    if (reportLoading) return;
    setShowReportModal(false);
    setReportError("");
  }  

  // submits the reprot
  async function handleReportSubmit(e) {
    e.preventDefault();

    if (hasUserReported) {
      setReportError("You have already reported this post.");
      return;
    }

    try {
      setReportLoading(true);
      setReportError("");
      setReportSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/trails/${id}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: reportReason,
            message: reportMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setTrail((prevTrail) => ({
        ...prevTrail,
        moderationStatus: "under_investigation",
        reports: [
          ...(prevTrail.reports || []),
          {
            reportedBy: currentUserId,
            reason: reportReason,
            message: reportMessage,
          },
        ],
      }));

      setReportMessage("");
      setShowReportModal(false);
      setReportSuccess("Report submitted successfully.");
    } catch (err) {
      console.error("Report error:", err);
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  }

  // navigagte to login on page error or go back
  if (pageError) {
    return (
      <div className="dashboard-container">
        <h2>Oops!</h2>
        <p>{pageError}</p>
        <button onClick={() => navigate(-1)} className="login-button">
          Go Back
        </button>
      </div>
    );
  }

  // show loading while fetching
  if (!trail) {
    return <div className="dashboard-container">Loading...</div>;
  }

  // current user id
  const currentUserId = user?.id || user?._id;

  // checks if user id matches owner of post
  const isOwner =
    user &&
    trail.user &&
    (trail.user._id === currentUserId || trail.user === currentUserId);

  // checks if current user has reported this post
  const hasUserReported =
    !!currentUserId &&
    Array.isArray(trail.reports) &&
    trail.reports.some((report) => {
      const reportedById = report.reportedBy?._id || report.reportedBy;
      return String(reportedById) === String(currentUserId);
    });

  const moderationStatus = trail.moderationStatus || "active";

  // visual UI for whole page
  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="logout-button">
          ← Back
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-image-section">
          {trail.imgUrl ? (
            <img
              src={trail.imgUrl}
              alt={trail.title}
              className="trail-detail-image"
            />
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        <div className="trail-detail-info-section">
          <div className="post-author-header">
            <div
              className="post-author-info"
              onClick={() => navigate(`/user-moments/${trail.user?._id}`)}
              style={{ textDecoration: "none" }}
            >
              <div className="post-author-avatar">
                {trail.user?.username?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="post-author-name">
                {trail.user?.username ?? "Unknown"}
              </span>
            </div>

            <div className="post-author-actions">
              {user?.role === "admin" ? (
                <button
                  className="trail-action-button trail-action-delete"
                  onClick={() => openDeleteModal("admin")}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              ) : (
                !isOwner && (
                  <button
                    className="trail-action-button trail-action-report"
                    onClick={openReportModal}
                    disabled={hasUserReported}
                    title={
                      hasUserReported
                        ? "You have already reported this post."
                        : "Report this post"
                    }
                  >
                    {hasUserReported ? "Already Reported" : "Report"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="trail-title-row">
            <h1 className="trail-detail-title">{trail.title}</h1>
          </div>

          {moderationStatus === "under_investigation" && (
            <span className="title-status-badge under-investigation">
              Under Investigation
            </span>
          )}

          <p className="trail-detail-description">{trail.description}</p>

          {trail.tag &&
            (() => {
              const match = dataSet.find(
                (t) =>
                  t.trailTitle.toLowerCase().trim() ===
                  trail.tag.toLowerCase().trim()
              );

              return (
                <div className="trail-tag-group">
                  <div className="trail-detail-tag">{trail.tag}</div>
                  {match && (
                    <button
                      className="view-trail-button"
                      onClick={() => navigate(`/trail-result/${match.id}`)}
                    >
                      View Trail
                    </button>
                  )}

                  {user && (
                    <button
                      className="favorite-button"
                      onClick={handleFavoriteToggle}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading
                        ? "Loading..."
                        : isFavorited
                        ? "★ Unfavorite"
                        : "☆ Favorite"}
                    </button>
                  )}
                </div>
              );
            })()}

          {reportError && <p className="form-message error">{reportError}</p>}
          {reportSuccess && (
            <p className="form-message success">{reportSuccess}</p>
          )}

          {isOwner && (
            <div className="trail-delete-container">
              <button
                onClick={() => openDeleteModal("owner")}
                className="trail-delete-button"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Trail"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>{deleteMode === "admin" ? "Delete Post" : "Delete Trail"}</h2>
              <button
                className="delete-modal-close"
                onClick={closeDeleteModal}
                type="button"
                disabled={deleteLoading}
              >
                ×
              </button>
            </div>

            <p className="delete-modal-text">
              {deleteMode === "admin"
                ? "Are you sure you want to delete this trail post? This cannot be undone."
                : "Are you sure you want to delete this trail post? This cannot be undone."}
            </p>

            {deleteError && <p className="delete-modal-error">{deleteError}</p>}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel-button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm-button"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="report-modal-overlay" onClick={closeReportModal}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h2>Report Post</h2>
              <button
                className="report-modal-close"
                onClick={closeReportModal}
                type="button"
                disabled={reportLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="report-form">
              <div className="report-form-group">
                <label htmlFor="reportReason">Report Reason</label>
                <select
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="report-input"
                >
                  <option value="offensive">Offensive Content</option>
                  <option value="harassment">Harassment</option>
                  <option value="hate_speech">Hate Speech</option>
                  <option value="spam">Spam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="report-form-group">
                <label htmlFor="reportMessage">Extra Details</label>
                <textarea
                  id="reportMessage"
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Explain why you are reporting this post"
                  rows="4"
                  className="report-input report-textarea"
                />
              </div>

              {reportError && (
                <p className="form-message error">{reportError}</p>
              )}

              <div className="report-modal-actions">
                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={closeReportModal}
                  disabled={reportLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="report-submit-button"
                  disabled={reportLoading || hasUserReported}
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div
          className="login-prompt-overlay"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="login-prompt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="login-prompt-title">Login required</h3>
            <p className="login-prompt-text">
              You need to be logged in to report a post.
            </p>
            <div className="login-prompt-actions">
              <button
                className="login-prompt-login"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
              <button
                className="login-prompt-dismiss"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrailDetail;