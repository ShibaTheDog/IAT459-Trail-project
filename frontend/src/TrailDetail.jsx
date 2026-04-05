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

  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [reportReason, setReportReason] = useState("offensive");
  const [reportMessage, setReportMessage] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

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

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trail post?"
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(`http://localhost:5000/api/trails/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete trail");
      }

      alert("Trail deleted successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

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

  function closeReportModal() {
    if (reportLoading) return;
    setShowReportModal(false);
    setReportError("");
  }

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

  if (!trail) {
    return <div className="dashboard-container">Loading...</div>;
  }

  const currentUserId = user?.id || user?._id;

  const isOwner =
    user &&
    trail.user &&
    (trail.user._id === currentUserId || trail.user === currentUserId);

  const hasUserReported =
    !!currentUserId &&
    Array.isArray(trail.reports) &&
    trail.reports.some((report) => {
      const reportedById = report.reportedBy?._id || report.reportedBy;
      return String(reportedById) === String(currentUserId);
    });

  const moderationStatus = trail.moderationStatus || "active";

  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="logout-button">
          ← Back
        </button>
      </div>

      <div className="trail-detail-container">
        {user?.role === "admin" ? (
          <button
            className="trail-action-button trail-action-delete"
            onClick={handleAdminDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </button>
        ) : (
          !isOwner && (
            <div className="report-action-wrapper">
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
            </div>
          )
        )}

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
            <div className="post-author-avatar">
              {trail.user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <span className="post-author-name">
              {trail.user?.username ?? "Unknown"}
            </span>
          </div>

          <div className="trail-title-row">
            <h1 className="trail-detail-title">{trail.title}</h1>

            {moderationStatus === "under_investigation" && (
              <span className="title-status-badge under-investigation">
                Under Investigation
              </span>
            )}
          </div>

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
                onClick={handleDelete}
                className="trail-delete-button"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Trail"}
              </button>
            </div>
          )}
        </div>
      </div>

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