import { useContext, useEffect, useRef, useState } from "react";
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

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);
  const [isPostFilterDropdownOpen, setIsPostFilterDropdownOpen] =
    useState(false);
  const [isDogFriendlyDropdownOpen, setIsDogFriendlyDropdownOpen] =
    useState(false);
  const [showDogFriendly, setShowDogFriendly] = useState(true);
  const [showNotDogFriendly, setShowNotDogFriendly] = useState(true);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);
  const [minDistance, setMinDistance] = useState(0);
  const [maxDistance, setMaxDistance] = useState(30);

  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showWithPosts, setShowWithPosts] = useState(true);
  const [showWithoutPosts, setShowWithoutPosts] = useState(true);

  const searchWrapperRef = useRef(null);

  const mapOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, []);

  useEffect(() => {
    if (!user || !token) {
      setCurrentUserProfile(null);
      return;
    }

    fetch("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserProfile(data.user))
      .catch((err) => {
        console.error("Error fetching current user profile:", err);
        setCurrentUserProfile(null);
      });
  }, [user, token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setSearchResults([]);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTrailFlagged = (trail) =>
    trail.moderationStatus === "under_investigation" ||
    trail.moderationStatus === "removed";

  function isFavoritedByCurrentUser(trail) {
    if (!currentUserProfile || !Array.isArray(currentUserProfile.favorites)) {
      return false;
    }

    return currentUserProfile.favorites.some((favoriteTrail) => {
      const favoriteTrailId = favoriteTrail?._id || favoriteTrail;
      return String(favoriteTrailId) === String(trail._id || trail.id);
    });
  }

  function handleSearch(e) {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    const q = value.toLowerCase();

    let filtered = dataSet.filter(
      (trail) =>
        trail.trailTitle.toLowerCase().includes(q) ||
        trail.region.toLowerCase().includes(q)
    );

    filtered = filtered.filter((trail) => {
      const hasPost = trails.some(
        (post) =>
          !isTrailFlagged(post) &&
          post.tag &&
          post.tag.toLowerCase().trim() ===
            trail.trailTitle.toLowerCase().trim()
      );

      if (hasPost && !showWithPosts) return false;
      if (!hasPost && !showWithoutPosts) return false;

      return true;
    });

    setSearchResults(filtered.slice(0, 8));
  }

  function highlightMatch(text, query) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <strong>{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const myTrails = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId === loggedInUserId;
      })
    : [];

  const topHikingMoments = user
    ? trails.filter((trail) => {
        const postUserId = trail.user?._id || trail.user;
        const loggedInUserId = user?.id || user?._id;
        return postUserId !== loggedInUserId && !isTrailFlagged(trail);
      })
    : trails.filter((trail) => !isTrailFlagged(trail));

  return (
    <>
      <div className="dashboard-container">
        <div className="hero-section">
          <div className="hero-overlay" />

          <div className="hero-content">
            <h1 className="hero-title">
              {user ? `Welcome back, ${user.username}` : "Welcome to TrailTracker"}
            </h1>

            <div className="hero-search-wrapper" ref={searchWrapperRef}>
              <div className="search-bar-wrapper">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search by trail name"
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults.length > 0) {
                        setSearchQuery("");
                        setSearchResults([]);
                        navigate(`/trail-result/${searchResults[0].id}`);
                      }
                    }}
                    className="trail-search-input"
                  />
                </div>

                <div className="search-filter-container">
                  <button
                    className="search-filter-button"
                    onClick={() =>
                      setIsPostFilterDropdownOpen(!isPostFilterDropdownOpen)
                    }
                  >
                    Filter
                    <span
                      className={`dropdown-arrow ${
                        isPostFilterDropdownOpen ? "open" : ""
                      }`}
                    >
                      &#9662;
                    </span>
                  </button>

                  {isPostFilterDropdownOpen && (
                    <div className="search-filter-dropdown">
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={showWithPosts}
                          onChange={() => setShowWithPosts(!showWithPosts)}
                        />
                        With Posts
                      </label>

                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={showWithoutPosts}
                          onChange={() => setShowWithoutPosts(!showWithoutPosts)}
                        />
                        Without Posts
                      </label>
                    </div>
                  )}
                </div>

                {searchQuery.trim() && (
                  <div className="search-dropdown">
                    {searchResults.length === 0 ? (
                      <div className="search-result-empty">
                        No trails found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      searchResults.map((trail) => (
                        <div
                          key={trail.id}
                          className="search-result-item"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            navigate(`/trail-result/${trail.id}`);
                          }}
                        >
                          <div className="search-result-title">
                            {highlightMatch(trail.trailTitle, searchQuery)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="moments-section other-moments">
          <h2>Top Hiking Moment</h2>
          {topHikingMoments.length === 0 ? (
            <div className="empty-state">
              <p>
                <strong>No moments shared by others yet.</strong>
              </p>
            </div>
          ) : (
            <div className="trails-grid trails-grid-4col">
              {topHikingMoments.slice(0, 8).map((trail) => (
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
                    <div className="trail-card-title-row">
                      <h3>{trail.title}</h3>
                      {isFavoritedByCurrentUser(trail) && (
                        <span className="trail-favorite-badge" title="Favorited">
                          ★
                        </span>
                      )}
                    </div>

                    {trail.user?.username && (
                      <p
                        className="trail-card-username"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/user-moments/${trail.user._id || trail.user.id}`
                          );
                        }}
                      >
                        {trail.user.username}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                  className="create-post-button"
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
                  className="create-post-button"
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
                      <div className="trail-card-title-row">
                        <h3>{trail.title}</h3>
                        {isFavoritedByCurrentUser(trail) && (
                          <span className="trail-favorite-badge" title="Favorited">
                            ★
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
                    className={`dropdown-arrow ${
                      isDistanceDropdownOpen ? "open" : ""
                    }`}
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

                    <div
                      className="dual-range-wrapper"
                      style={{
                        "--fill-left": `${(minDistance / 30) * 100}%`,
                        "--fill-right": `${((30 - maxDistance) / 30) * 100}%`,
                      }}
                    >
                      <div className="dual-range-track">
                        <div className="dual-range-fill" />
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
                    className={`dropdown-arrow ${
                      isDogFriendlyDropdownOpen ? "open" : ""
                    }`}
                  >
                    &#9662;
                  </span>
                </button>

                {isDogFriendlyDropdownOpen && (
                  <div className="dropdown-menu">
                    <label className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={showDogFriendly}
                        onChange={() => setShowDogFriendly(!showDogFriendly)}
                      />
                      Dog Friendly
                    </label>

                    <label className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={showNotDogFriendly}
                        onChange={() => setShowNotDogFriendly(!showNotDogFriendly)}
                      />
                      Not Dog Friendly
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
                    className={`dropdown-arrow ${
                      isDifficultyDropdownOpen ? "open" : ""
                    }`}
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
              options={mapOptions}
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
                  if (trail.dogFriendly && !showDogFriendly) return false;
                  if (!trail.dogFriendly && !showNotDogFriendly) return false;
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
                  <div className="map-info-window">
                    <h3>{selectedTrail.trailTitle}</h3>
                    <p>Difficulty: {selectedTrail.difficulty}</p>
                    <p>Region: {selectedTrail.region}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        <div className="bottom-buffer"></div>
      </div>
    </>
  );
}

export default Dashboard;