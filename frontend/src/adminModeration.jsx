import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/adminStylesheet.css";

function AdminModeration() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reportedTrails, setReportedTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    async function fetchReportedTrails() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/trails/admin/reported",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to load reported trails");
        setReportedTrails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReportedTrails();
  }, []);

  async function handleDeletePost(trailId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setDeleteLoadingId(trailId);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/trails/admin/${trailId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      setReportedTrails((prev) =>
        prev.filter((trail) => trail._id !== trailId),
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="admin-page">
      <div className="admin-back-row">
        <button className="admin-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="admin-title-row">
        <h1 className="admin-title">Admin Moderation</h1>
      </div>

      {loading && (
        <div className="admin-loading">
          <p>Loading reported posts…</p>
        </div>
      )}

      {error && (
        <div className="admin-error-box">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && reportedTrails.length === 0 && (
        <div className="admin-empty-state">
          <p>✓ No reported posts right now. Everything looks clean.</p>
        </div>
      )}

      {!loading && !error && reportedTrails.length > 0 && (
        <div className="admin-report-list">
          {reportedTrails.map((trail) => (
            <div key={trail._id} className="admin-report-card">
              {/* Image column */}
              <div className="admin-card-image-col">
                {trail.imgUrl && trail.imgUrl.trim() !== "" ? (
                  <img
                    src={trail.imgUrl}
                    alt={trail.title}
                    className="admin-card-image"
                  />
                ) : (
                  <div className="admin-card-no-image">No Image</div>
                )}
              </div>

              {/* Info column */}
              <div className="admin-card-info-col">
                <div className="admin-card-title-row">
                  <h2 className="admin-card-title">{trail.title}</h2>
                  <span className="admin-status-badge">
                    {trail.moderationStatus === "under_investigation"
                      ? "Under Investigation"
                      : trail.moderationStatus}
                  </span>
                </div>

                {trail.description && (
                  <p className="admin-card-description">{trail.description}</p>
                )}

                <div className="admin-card-meta">
                  <div className="admin-meta-item">
                    <span className="admin-meta-label">Post Owner</span>
                    <span className="admin-meta-value">
                      {trail.user?.username || "Unknown"}
                    </span>
                  </div>
                  <div className="admin-meta-item">
                    <span className="admin-meta-label">Total Reports</span>
                    <span className="admin-meta-value admin-meta-count">
                      {trail.reports?.length || 0}
                    </span>
                  </div>
                </div>

                {trail.reports?.length > 0 && (
                  <div className="admin-reports-section">
                    <div className="admin-reports-list">
                      {trail.reports.map((report, index) => (
                        <div key={index} className="admin-single-report">
                          <div className="admin-report-reason-badge">
                            {report.reason}
                          </div>
                          <p className="admin-report-by">
                            Reported by{" "}
                            <strong>
                              {report.reportedBy?.username || "Unknown"}
                            </strong>
                          </p>
                          {report.message && (
                            <p className="admin-report-detail">
                              "{report.message}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="admin-card-actions">
                  <button
                    className="admin-view-post-button"
                    onClick={() => navigate(`/trail/${trail._id}`)}
                  >
                    View
                  </button>
                  <button
                    className="admin-delete-post-button"
                    onClick={() => handleDeletePost(trail._id)}
                    disabled={deleteLoadingId === trail._id}
                  >
                    {deleteLoadingId === trail._id ? "Deleting…" : "Delete "}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminModeration;
