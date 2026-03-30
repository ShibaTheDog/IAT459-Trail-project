import { useContext, useEffect, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import {GoogleMap,Marker,InfoWindow,useJsApiLoader,} from "@react-google-maps/api";
import { dataSet } from "./assets/dataSet";

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);

  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);
  const [isPostFilterDropdownOpen, setIsPostFilterDropdownOpen] =
    useState(false);

  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

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

  const myTrails = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId === loggedInUserId;
      })
    : [];

  const otherTrails = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId !== loggedInUserId;
      })
    : trails;

  const uniqueTrails = [
    ...new Set(
      myTrails.map((post) => post.tag?.toLowerCase().trim()).filter(Boolean),
    ),
  ];

  const trailsVisitedCount = uniqueTrails.length;

  const totalHoursHiked = uniqueTrails.reduce((total, tag) => {
    const matchingTrail = dataSet.find(
      (t) => t.trailTitle?.toLowerCase().trim() === tag,
    );

    if (matchingTrail && matchingTrail.time) {
      return total + parseFloat(matchingTrail.time);
    }
    return total;
  }, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {user ? (
         <>
          <h1>Welcome {user.username}</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="login-button"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </>
        ) : (
          <>
            <h1>Welcome to TrailTracker</h1>
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
          </>
        )}
      </header>

      <div className="moments-section other-moments">
        <h2>Check Out Other Moment</h2>
        {otherTrails.length === 0 ? (
          <div className="empty-state">
            <p>
              <strong>No moments shared by others yet.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {otherTrails.map((trail) => (
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

      {/* --- MY TRAIL MOMENT SECTION --- */}
      <div className="moments-section my-moments">
        {!user ? (
          <>
            <h2>My Trail Moment</h2>
            <div className="empty-state">
              <p>
                <strong>
                  You must login or create an account to make a post
                </strong>
              </p>
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </>
        ) : myTrails.length === 0 ? (
          <>
            <h2>My Trail Moment</h2>
            <div className="empty-state">
              <p>
                <strong>No posts created yet. Why not create one?</strong>
              </p>
              <button
                className="login-button"
                onClick={() => navigate("/create-post")}
              >
                Create post
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="section-header-row">
              <h2>My Trail Moment</h2>
              <button
                className="login-button"
                onClick={() => navigate("/create-post")}
              >
                Create post
              </button>
            </div>
            <div className="trails-grid">
              {myTrails.map((trail) => (
                <div
                  key={trail._id || trail.id}
                  className="trail-card"
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
          </>
        )}
      </div>

      <div className="statistics-section">
        <h2>My Statistics</h2>
        {!user ? (
          <div className="empty-state">
            <p>
              <strong>You must login to view your statistics</strong>
            </p>
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{trailsVisitedCount}</span>
              <span className="stat-label">Trail visited</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{myTrails.length}</span>
              <span className="stat-label">Trail Moments</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalHoursHiked}</span>
              <span className="stat-label">Hours Hiked</span>
            </div>
          </div>
        )}
      </div>

      <div className="map-section">
        <h2>Trail Map</h2>

        <div className="filter-dropdown-container">
          <button
            className="dropdown-toggle-button"
            onClick={() =>
              setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)
            }
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

      <div className="search-selection">
        <div className="search-header-row">
          <h2>Trail Search</h2>

          <div className="filter-dropdown-container">
            <button
              className="dropdown-toggle-button"
              onClick={() =>
                setIsPostFilterDropdownOpen(!isPostFilterDropdownOpen)
              }
            >
              {showOnlyWithPosts ? "Trails With Posts" : "All Trails"}
              <span
                className={`dropdown-arrow ${isPostFilterDropdownOpen ? "open" : ""}`}
              >
                &#9662;
              </span>
            </button>

            {isPostFilterDropdownOpen && (
              <div className="dropdown-menu">
                <label className="dropdown-item">
                  <input
                    type="radio"
                    name="postFilter"
                    checked={!showOnlyWithPosts}
                    onChange={() => {
                      setShowOnlyWithPosts(false);
                      setIsPostFilterDropdownOpen(
                        false,
                      ); /* Closes menu on click */
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
                      setIsPostFilterDropdownOpen(
                        false,
                      ); /* Closes menu on click */
                    }}
                  />
                  Only Trails With Posts
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search trails..."
            value={searchQuery}
            onChange={handleSearch}
            className="trail-search-input"
          />

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

      <div className="bottom-buffer"></div>
    </div>
  );
}

export default Dashboard;
