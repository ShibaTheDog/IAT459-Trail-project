import { useContext, useEffect, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { dataSet } from "./assets/dataSet";
import heroBg from "./assets/background-image.jpg";

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);

  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);
  const [isPostFilterDropdownOpen, setIsPostFilterDropdownOpen] =
    useState(false);
  const [isDogFriendlyDropdownOpen, setIsDogFriendlyDropdownOpen] =
    useState(false);
  const [dogFriendlyFilter, setDogFriendlyFilter] = useState("all");
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);
  const [minDistance, setMinDistance] = useState(0);
  const [maxDistance, setMaxDistance] = useState(30);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // map variables
  const containerStyle = {
    width: "100%",
    height: "32rem",
  };
  const center = {
    lat: 49.2827,
    lng: -123.1207,
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCABOU21t-X5vEFyLq7rzKd__B-dEbXAeE",
  });
  const [showEasy, setShowEasy] = useState(true);
  const [showIntermediate, setShowIntermediate] = useState(true);
  const [showDifficult, setShowDifficult] = useState(true);
  const [mapCenter, setMapCenter] = useState(center);

  //search variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showOnlyWithPosts, setShowOnlyWithPosts] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  function handleSearch(e) {
    const value = e.target.value;
    setSearchQuery(value);

    let filtered = dataSet;

    if (value.trim() !== "") {
      filtered = dataSet.filter((trail) =>
        trail.trailTitle.toLowerCase().includes(value.toLowerCase()),
      );
    }

    if (showOnlyWithPosts) {
      filtered = filtered.filter((trail) =>
        trails.some(
          (post) =>
            post.tag &&
            post.tag.toLowerCase().trim() ===
              trail.trailTitle.toLowerCase().trim(),
        ),
      );
    }

    setSearchResults(filtered.slice(0, 5));
  }

  const otherTrails = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId !== loggedInUserId;
      })
    : trails;

  return (
    <div className="dashboard-container">
      {/* ── Hero Section ── */}
      <div
        className="hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="hero-overlay" />

        <nav className="hero-nav">
          <span className="hero-logo">TrailTracker</span>
          {user ? (
            <div
              className="profile-avatar"
              onClick={() => navigate("/profile")}
              title="View Profile"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="header-buttons">
              <button
                className="button-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="button-primary"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            {user
              ? `Welcome back, ${user.username}`
              : "Welcome to TrailTracker"}
          </h1>

          <div className="hero-search-wrapper">
            <div className="search-bar-wrapper">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search by city, park, or trail name"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="trail-search-input"
                />
              </div>

              <div className="search-filter-divider" />

              <div className="search-filter-container">
                <button
                  className="search-filter-button"
                  onClick={() =>
                    setIsPostFilterDropdownOpen(!isPostFilterDropdownOpen)
                  }
                >
                  Trail
                  <span
                    className={`dropdown-arrow ${isPostFilterDropdownOpen ? "open" : ""}`}
                  >
                    &#9662;
                  </span>
                </button>

                {isPostFilterDropdownOpen && (
                  <div className="search-filter-dropdown">
                    <label className="dropdown-item">
                      <input
                        type="radio"
                        name="postFilter"
                        checked={!showOnlyWithPosts}
                        onChange={() => {
                          setShowOnlyWithPosts(false);
                          setIsPostFilterDropdownOpen(false);
                        }}
                      />
                      All Trails
                    </label>
                    <label className="dropdown-item">
                      <input
                        type="radio"
                        name="postFilter"
                        checked={showOnlyWithPosts}
                        onChange={() => {
                          setShowOnlyWithPosts(true);
                          setIsPostFilterDropdownOpen(false);
                        }}
                      />
                      Only With Posts
                    </label>
                  </div>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((trail) => (
                  <div
                    key={trail.id}
                    className="search-result-item"
                    onClick={() => navigate(`/trail-result/${trail.id}`)}
                  >
                    {trail.trailTitle}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="map-section">
        <div className="map-section-header">
          <h2>Explore Trail</h2>

          <div className="filter-group">
            <div className="filter-dropdown-container">
              <button
                className="dropdown-toggle-button"
                onClick={() => {
                  setIsDistanceDropdownOpen(!isDistanceDropdownOpen);
                  setIsDogFriendlyDropdownOpen(false);
                  setIsDifficultyDropdownOpen(false);
                }}
              >
                Distance
                <span
                  className={`dropdown-arrow ${isDistanceDropdownOpen ? "open" : ""}`}
                >
                  &#9662;
                </span>
              </button>

              {isDistanceDropdownOpen && (
                <div className="dropdown-menu distance-dropdown-menu">
                  <div className="distance-range-label">
                    {minDistance === 0 && maxDistance === 30
                      ? "Any"
                      : `${minDistance}–${maxDistance} km`}
                  </div>
                  <div className="dual-range-wrapper">
                    <div className="dual-range-track">
                      <div
                        className="dual-range-fill"
                        style={{
                          left: `${(minDistance / 30) * 100}%`,
                          right: `${((30 - maxDistance) / 30) * 100}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={minDistance}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (v <= maxDistance) setMinDistance(v);
                      }}
                      className="dual-range-input"
                    />
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={maxDistance}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (v >= minDistance) setMaxDistance(v);
                      }}
                      className="dual-range-input"
                    />
                  </div>
                  <div className="dual-range-endpoints">
                    <span>0 km</span>
                    <span>30 km+</span>
                  </div>
                  {(minDistance > 0 || maxDistance < 30) && (
                    <button
                      className="distance-clear-button"
                      onClick={() => {
                        setMinDistance(0);
                        setMaxDistance(30);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="filter-dropdown-container">
              <button
                className="dropdown-toggle-button"
                onClick={() => {
                  setIsDogFriendlyDropdownOpen(!isDogFriendlyDropdownOpen);
                  setIsDistanceDropdownOpen(false);
                  setIsDifficultyDropdownOpen(false);
                }}
              >
                Dog Friendly
                <span
                  className={`dropdown-arrow ${isDogFriendlyDropdownOpen ? "open" : ""}`}
                >
                  &#9662;
                </span>
              </button>

              {isDogFriendlyDropdownOpen && (
                <div className="dropdown-menu">
                  <label className="dropdown-item">
                    <input
                      type="radio"
                      name="dogFilter"
                      checked={dogFriendlyFilter === "yes"}
                      onChange={() => {
                        setDogFriendlyFilter("yes");
                        setIsDogFriendlyDropdownOpen(false);
                      }}
                    />
                    Yes
                  </label>
                  <label className="dropdown-item">
                    <input
                      type="radio"
                      name="dogFilter"
                      checked={dogFriendlyFilter === "no"}
                      onChange={() => {
                        setDogFriendlyFilter("no");
                        setIsDogFriendlyDropdownOpen(false);
                      }}
                    />
                    No
                  </label>
                </div>
              )}
            </div>

            <div className="filter-dropdown-container">
              <button
                className="dropdown-toggle-button"
                onClick={() => {
                  setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen);
                  setIsDistanceDropdownOpen(false);
                  setIsDogFriendlyDropdownOpen(false);
                }}
              >
                Difficulty
                <span
                  className={`dropdown-arrow ${isDifficultyDropdownOpen ? "open" : ""}`}
                >
                  &#9662;
                </span>
              </button>

              {isDifficultyDropdownOpen && (
                <div className="dropdown-menu">
                  <label className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={showEasy}
                      onChange={() => setShowEasy(!showEasy)}
                    />
                    Easy
                  </label>

                  <label className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={showIntermediate}
                      onChange={() => setShowIntermediate(!showIntermediate)}
                    />
                    Intermediate
                  </label>

                  <label className="dropdown-item">
                    <input
                      type="checkbox"
                      checked={showDifficult}
                      onChange={() => setShowDifficult(!showDifficult)}
                    />
                    Difficult
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={8}
            onIdle={(map) => {
              const c = map.getCenter();
              setMapCenter({ lat: c.lat(), lng: c.lng() });
            }}
          >
            {dataSet
              .filter((trail) => {
                if (trail.difficulty === "Easy" && !showEasy) return false;
                if (trail.difficulty === "Intermediate" && !showIntermediate)
                  return false;
                if (trail.difficulty === "Difficult" && !showDifficult)
                  return false;
                if (dogFriendlyFilter === "yes" && !trail.dogFriendly)
                  return false;
                if (dogFriendlyFilter === "no" && trail.dogFriendly)
                  return false;
                if (
                  trail.tripTime < minDistance ||
                  trail.tripTime > maxDistance
                )
                  return false;
                return true;
              })
              .map((trail) => (
                <Marker
                  key={trail.id}
                  position={{ lat: trail.lat, lng: trail.lng }}
                  title={trail.trailTitle}
                  onClick={() => navigate(`/trail-result/${trail.id}`)}
                />
              ))}

            {selectedTrail && (
              <InfoWindow
                position={{
                  lat: selectedTrail.lat,
                  lng: selectedTrail.lng,
                }}
                onCloseClick={() => setSelectedTrail(null)}
              >
                <div style={{ color: "black" }}>
                  <h3>{selectedTrail.trailTitle}</h3>
                  <p>Difficulty: {selectedTrail.difficulty}</p>
                  <p>Region: {selectedTrail.region}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      <div className="moments-section other-moments">
        <h2>Top Hiking Moment</h2>
        {otherTrails.length === 0 ? (
          <div className="empty-state">
            <p>
              <strong>No moments shared by others yet.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid trails-grid-4col">
            {otherTrails.slice(0, 8).map((trail) => (
              <div
                key={trail._id || trail.id}
                className="trail-card"
                /* IMPORTANT: Ensure this route matches your App.js.
                   If you want to see the POST details, use the route for single posts.
                */
                onClick={() => navigate(`/trail/${trail._id || trail.id}`)}
              >
                {trail.imgUrl && trail.imgUrl.trim() !== "" ? (
                  <img src={trail.imgUrl} alt={trail.title} />
                ) : (
                  <div className="no-image-container">No Image</div>
                )}
                <div className="trail-info">
                  <h3>{trail.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-buffer"></div>
    </div>
  );
}

export default Dashboard;
