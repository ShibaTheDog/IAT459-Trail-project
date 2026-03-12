import { useContext, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { dataSet } from "./assets/dataSet";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "imgUrl") {
      setPreviewUrl(value);
    }
  };

  const handleDrag = (file) => {
    if (file && file.type.startsWith("image/")) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!user) return;
    const file = e.dataTransfer.files[0];
    handleDrag(file);
  };

  function handleSearch(e) {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = dataSet.filter((trail) =>
      trail.trailTitle.toLowerCase().includes(value.toLowerCase()),
    );
    setSearchResults(filtered.slice(0, 5));
  }
  const selectTrail = (trail) => {
    setFormData({ ...formData, tag: trail.trailTitle });
    setSearchQuery(trail.trailTitle);
    setSearchResults([]);
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

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Share Your Trail Moment</h1>
        <button
          className="logout-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

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
            <label>Select Trail Tag</label>
            <div>
              <input
                type="text"
                placeholder="Search trails..."
                value={searchQuery}
                onChange={handleSearch}
                className="trail-search-input"
                disabled={!user}
              />
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((trail) => (
                    <div
                      key={trail.id}
                      className="search-result-item"
                      onClick={() => selectTrail(trail)}
                    >
                      {trail.trailTitle}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="input-group">
            <label>Selected Trail</label>
            <input value={formData.tag || "N/A"} disabled />
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
