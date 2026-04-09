// this page allows admin to view all of a sigular users posts on admin specifc page

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./stylesheets/adminStylesheet.css";

function AdminUserPosts() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // fetch posts for userID and search input change
  useEffect(() => {
    fetchUserPosts();
  }, [userId, search]);

  // fetch posts from backend for particula user
  async function fetchUserPosts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const url = `http://localhost:5000/api/trails/admin/user/${userId}/posts${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load user posts");
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // visual UI for AdminUserPosts
  return (
    <div className="admin-page">
      <div className="admin-back-row">
        <button className="admin-back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="admin-title-row">
        <h1 className="admin-title">User Posts</h1>
      </div>

      <div className="admin-user-toolbar">
        <input
          type="text"
          className="admin-user-search"
          placeholder="Search posts by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="admin-loading">
          <p>Loading user posts…</p>
        </div>
      )}

      {error && (
        <div className="admin-error-box">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="admin-empty-state">
          <p>No posts found for this user.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="admin-user-posts-page-list">
          {posts.map((post) => (
            <div key={post._id} className="admin-user-post-page-card">
              <div className="admin-user-post-page-main">
                <div className="admin-user-post-page-text">
                  <h2 className="admin-user-post-title">{post.title}</h2>

                  {post.tag && (
                    <p className="admin-user-post-tag">
                      Trail: {post.tag}
                    </p>
                  )}

                  {post.description && (
                    <p className="admin-user-post-description">
                      {post.description}
                    </p>
                  )}

                  {post.moderationStatus === "under_investigation" && (
                    <span className="admin-status-badge">
                      Under Investigation
                    </span>
                  )}
                </div>

                <div className="admin-card-actions">
                  <button
                    className="admin-view-post-button"
                    onClick={() => navigate(`/trail/${post._id}`)}
                  >
                    Visit Post
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

export default AdminUserPosts;