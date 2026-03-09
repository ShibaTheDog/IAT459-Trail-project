import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./stylesheets/detail.css";

function TrailDetail() {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        setError("Could not load the trail details. Please try again.");
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

  if (error) {
    return (
      <div className="dashboard-container">
        <h2>Oops!</h2>
        <p>{error}</p>
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

  return (
    <div className="dashboard-page">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="logout-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="trail-detail-container">
        <div className="trail-detail-image-section">
          <img
            src={trail.imgUrl}
            alt={trail.title}
            className="trail-detail-image"
          />
        </div>

        <div className="trail-detail-info-section">
          <h1 className="trail-detail-title">{trail.title}</h1>
          <p className="trail-detail-description">{trail.description}</p>

          {trail.tag && <div className="trail-detail-tag">{trail.tag}</div>}

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
    </div>
  );
}

export default TrailDetail;