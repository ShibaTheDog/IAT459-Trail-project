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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load reported trails");
        }

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
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleteLoadingId(trailId);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/trails/admin/${trailId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      setReportedTrails((prev) =>
        prev.filter((trail) => trail._id !== trailId)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="admin-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Admin Moderation</h1>
      </div>

      {loading && <p>Loading reported posts...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && reportedTrails.length === 0 && (
        <div className="admin-empty-state">
          <p>No reported posts right now.</p>
        </div>
      )}

      {!loading && !error && reportedTrails.length > 0 && (
        <div className="admin-report-list">
          {reportedTrails.map((trail) => (
            <div key={trail._id} className="admin-report-card">
              <div className="admin-report-card-header">
                <h2>{trail.title}</h2>
                <span className="admin-status-badge">
                  {trail.moderationStatus === "under_investigation"
                    ? "Under Investigation"
                    : trail.moderationStatus}
                </span>
              </div>

              <p className="admin-report-description">{trail.description}</p>

              <p>
                <strong>Post Owner:</strong>{" "}
                {trail.user?.username || "Unknown user"}
              </p>

              <p>
                <strong>Total Reports:</strong> {trail.reports?.length || 0}
              </p>

              {trail.reports?.length > 0 && (
                <div className="admin-report-reasons">
                  <h3>Reports</h3>
                  {trail.reports.map((report, index) => (
                    <div key={index} className="admin-single-report">
                      <p>
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p>
                        <strong>Reported By:</strong>{" "}
                        {report.reportedBy?.username || "Unknown user"}
                      </p>
                      {report.message && (
                        <p>
                          <strong>Details:</strong> {report.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-card-actions">
                <button
                  className="admin-view-post-button"
                  onClick={() => navigate(`/trail/${trail._id}`)}
                >
                  View Post
                </button>

                <button
                  className="admin-delete-post-button"
                  onClick={() => handleDeletePost(trail._id)}
                  disabled={deleteLoadingId === trail._id}
                >
                  {deleteLoadingId === trail._id
                    ? "Deleting..."
                    : "Delete Post"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminModeration;