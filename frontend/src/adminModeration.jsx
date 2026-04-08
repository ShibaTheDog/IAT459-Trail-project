import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/adminStylesheet.css";

function AdminModeration() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("posts");

  const [reportedTrails, setReportedTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [resolveLoadingId, setResolveLoadingId] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
  });
  const [deleteUserLoadingId, setDeleteUserLoadingId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    isDanger: false,
    onConfirm: null,
  });

  function openConfirmModal({
    title,
    message,
    confirmLabel,
    isDanger,
    onConfirm,
  }) {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmLabel: confirmLabel || "Confirm",
      isDanger: !!isDanger,
      onConfirm,
    });
  }

  function closeConfirmModal() {
    setConfirmModal((prev) => ({ ...prev, open: false, onConfirm: null }));
  }

  useEffect(() => {
    fetchReportedTrails();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, userSearch, userPage]);

  async function fetchReportedTrails() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/trails/admin/reported", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load reported trails");
      }

      setReportedTrails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setReportedTrails([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setUsersLoading(true);
      setUsersError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        search: userSearch,
        page: String(userPage),
        limit: "20",
      });

      const res = await fetch(
        `http://localhost:5000/api/users/admin/users?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      const normalizedUsers = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data)
          ? data
          : [];

      const normalizedPagination = data?.pagination || {
        page: 1,
        totalPages: 1,
        totalUsers: normalizedUsers.length,
        limit: 20,
      };

      setUsersList(normalizedUsers);
      setUserPagination(normalizedPagination);
    } catch (err) {
      setUsersError(err.message);
      setUsersList([]);
      setUserPagination({
        page: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 20,
      });
    } finally {
      setUsersLoading(false);
    }
  }

  async function execDeletePost(trailId) {
    try {
      setDeleteLoadingId(trailId);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/trails/admin/${trailId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");

      setReportedTrails((prev) => prev.filter((trail) => trail._id !== trailId));
    } catch (err) {
      openConfirmModal({
        title: "Error",
        message: err.message,
        confirmLabel: "OK",
        isDanger: false,
        onConfirm: closeConfirmModal,
      });
    } finally {
      setDeleteLoadingId(null);
    }
  }

  function handleDeletePost(trailId) {
    openConfirmModal({
      title: "Delete Post",
      message: "Are you sure you want to delete this post? This action cannot be undone.",
      confirmLabel: "Delete",
      isDanger: true,
      onConfirm: () => {
        closeConfirmModal();
        execDeletePost(trailId);
      },
    });
  }

  async function execResolvePost(trailId) {
    try {
      setResolveLoadingId(trailId);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/trails/admin/${trailId}/resolve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve report");

      setReportedTrails((prev) => prev.filter((trail) => trail._id !== trailId));
    } catch (err) {
      openConfirmModal({
        title: "Error",
        message: err.message,
        confirmLabel: "OK",
        isDanger: false,
        onConfirm: closeConfirmModal,
      });
    } finally {
      setResolveLoadingId(null);
    }
  }

  function handleResolvePost(trailId) {
    openConfirmModal({
      title: "Resolve Report",
      message: "Mark this report as resolved and restore the post?",
      confirmLabel: "Resolve",
      isDanger: false,
      onConfirm: () => {
        closeConfirmModal();
        execResolvePost(trailId);
      },
    });
  }

  async function execDeleteUser(targetUser) {
    try {
      setDeleteUserLoadingId(targetUser._id);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/users/admin/users/${targetUser._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsersList((prev) => prev.filter((u) => u._id !== targetUser._id));
    } catch (err) {
      openConfirmModal({
        title: "Error",
        message: err.message,
        confirmLabel: "OK",
        isDanger: false,
        onConfirm: closeConfirmModal,
      });
    } finally {
      setDeleteUserLoadingId(null);
    }
  }

  function handleDeleteUser(targetUser) {
    openConfirmModal({
      title: "Delete Account",
      message: `Delete ${targetUser.username}'s account and all their posts? This cannot be undone.`,
      confirmLabel: "Delete Account",
      isDanger: true,
      onConfirm: () => {
        closeConfirmModal();
        execDeleteUser(targetUser);
      },
    });
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

      <div className="admin-nav-tabs">
        <button
          className={`admin-nav-tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Post Moderation
        </button>
        <button
          className={`admin-nav-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setUserPage(1);
          }}
        >
          User Moderation
        </button>
      </div>

      {activeTab === "posts" && (
        <>
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
                        className="admin-resolve-post-button"
                        onClick={() => handleResolvePost(trail._id)}
                        disabled={resolveLoadingId === trail._id}
                      >
                        {resolveLoadingId === trail._id ? "Resolving…" : "Resolve"}
                      </button>

                      <button
                        className="admin-delete-post-button"
                        onClick={() => handleDeletePost(trail._id)}
                        disabled={deleteLoadingId === trail._id}
                      >
                        {deleteLoadingId === trail._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <>
          <div className="admin-user-toolbar">
            <input
              type="text"
              className="admin-user-search"
              placeholder="Search users by username or email..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
            />
          </div>

          {usersLoading && (
            <div className="admin-loading">
              <p>Loading users…</p>
            </div>
          )}

          {usersError && (
            <div className="admin-error-box">
              <p>{usersError}</p>
            </div>
          )}

          {!usersLoading && !usersError && usersList.length === 0 && (
            <div className="admin-empty-state">
              <p>No users found.</p>
            </div>
          )}

          {!usersLoading && !usersError && usersList.length > 0 && (
            <>
              <div className="admin-user-list">
                {usersList.map((targetUser) => {
                  const isCurrentAdmin =
                    String(targetUser._id) === String(user.id);
                  const isAdminAccount = targetUser.role === "admin";

                  return (
                    <div key={targetUser._id} className="admin-user-card">
                      <div className="admin-user-main">
                        <div className="admin-user-avatar">
                          {targetUser.username?.charAt(0).toUpperCase() || "?"}
                        </div>

                        <div className="admin-user-text">
                          <h2 className="admin-user-name">
                            {targetUser.username}
                          </h2>
                          <p className="admin-user-email">{targetUser.email}</p>
                        </div>
                      </div>

                      <div className="admin-user-badges">
                        <span
                          className={`admin-role-badge ${
                            targetUser.role === "admin" ? "admin" : "user"
                          }`}
                        >
                          {targetUser.role === "admin" ? "Admin" : "User"}
                        </span>
                      </div>

                      <div className="admin-card-actions">
                        <button
                          className="admin-view-user-posts-button"
                          onClick={() =>
                            navigate(`/admin/users/${targetUser._id}/posts`)
                          }
                        >
                          View Posts
                        </button>

                        <button
                          className="admin-delete-user-button"
                          onClick={() => handleDeleteUser(targetUser)}
                          disabled={
                            deleteUserLoadingId === targetUser._id ||
                            isCurrentAdmin ||
                            isAdminAccount
                          }
                        >
                          {deleteUserLoadingId === targetUser._id
                            ? "Deleting…"
                            : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="admin-pagination">
                <button
                  className="admin-page-button"
                  disabled={(userPagination?.page || 1) <= 1}
                  onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>

                <span className="admin-page-indicator">
                  Page {userPagination?.page || 1} of{" "}
                  {userPagination?.totalPages || 1}
                </span>

                <button
                  className="admin-page-button"
                  disabled={
                    (userPagination?.page || 1) >=
                    (userPagination?.totalPages || 1)
                  }
                  onClick={() =>
                    setUserPage((prev) =>
                      Math.min(prev + 1, userPagination?.totalPages || 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}

      {confirmModal.open && (
        <div className="admin-modal-overlay" onClick={closeConfirmModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{confirmModal.title}</h2>
              <button
                className="admin-modal-close"
                onClick={closeConfirmModal}
                type="button"
              >
                ×
              </button>
            </div>

            <p className="admin-modal-text">{confirmModal.message}</p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel-button"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmModal.isDanger
                    ? "admin-modal-delete-button"
                    : "admin-modal-confirm-button"
                }
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModeration;