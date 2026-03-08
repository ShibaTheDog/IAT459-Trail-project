import { useContext, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function TrailForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    imgUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "imgUrl") {
      setPreviewUrl(e.target.value);
    }
  };

  const handleDrag = (file) => {
    if (file && file.type.startsWith("image/")) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setFormData({ ...formData, imgUrl: localPreview });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!user) return;
    const file = e.dataTransfer.files[0];
    handleDrag(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to post trail. Are you authorized?");
      }

      // Navigate back to the dashboard after posting
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="trail-form-section">
        <div
          className={`image-droparea ${!user ? "disabled" : ""}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview of the image"
              className="image-preview"
            />
          ) : (
            <div className="drop-placeholder">
              <p>Drag trail photo or paste URL below</p>
            </div>
          )}

          <input
            type="text"
            name="imgUrl"
            placeholder="Paste Image URL..."
            value={formData.imgUrl}
            onChange={handleChange}
            disabled={!user}
            className="url-input"
          />
        </div>

        <form className="trail-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="Add a title"
              value={formData.title}
              onChange={handleChange}
              disabled={!user}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <input
              name="description"
              placeholder="Add a description"
              value={formData.description}
              onChange={handleChange}
              disabled={!user}
              required
            />
          </div>

          <div className="input-group">
            <label>Tag</label>
            <input
              name="tag"
              placeholder="Add tags"
              value={formData.tag}
              onChange={handleChange}
              disabled={!user}
            />
          </div>

          <button type="submit" className="submit-button" disabled={!user}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrailForm;
