import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/detail.css";

function TrailDetail() {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
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

  const isOwner =
    user &&
    trail.user &&
    (trail.user._id === user.id || trail.user === user.id);

  const moderationStatus = trail.moderationStatus || "active";

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
            <div className="no-image-container">No image available</div>
          )}
        </div>

        <div className="trail-detail-info-section">
          <div className="trail-title-row">
            <h1 className="trail-detail-title">{trail.title}</h1>

            {moderationStatus === "under_investigation" && (
              <span className="title-status-badge under-investigation">
                Under Investigation
              </span>
            )}
          </div>

          <p className="trail-detail-description">{trail.description}</p>

          {trail.tag && <div className="trail-detail-tag">{trail.tag}</div>}

          {reportError && <p className="form-message error">{reportError}</p>}
          {reportSuccess && (
            <p className="form-message success">{reportSuccess}</p>
          )}

          {user && !isOwner && (
            <div className="trail-report-container">
              <button
                onClick={openReportModal}
                className="trail-report-button"
                type="button"
              >
                Report Post
              </button>
            </div>
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
          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >
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

              {reportError && <p className="form-message error">{reportError}</p>}

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
                  disabled={reportLoading}
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrailDetail;