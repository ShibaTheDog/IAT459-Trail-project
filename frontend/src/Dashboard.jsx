import { useContext, useEffect, useState } from "react";
import "./stylesheets/dashboard.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  const [trails, setTrails] = useState([]);
  const navigate = useNavigate();
  const { token, user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/trails")
      .then((res) => res.json())
      .then((data) => setTrails(data))
      .catch((err) => console.error("Error fetching trails:", err));
  }, [token, navigate]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to post trail. Are you authorized?");
      }

      const newTrail = await response.json();

      setTrails([...trails, newTrail]);

      setFormData({
        title: "",
        description: "",
        tag: "",
        imgUrl: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {user ? (
          <>
            <h1>Welcome {user.username}</h1>
            <button
              className="logout-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : null}
      </header>

      <div className="trail-form-section">
        <div className="image-droparea">
          <p>Drag an image here</p>
          <input
            type="text"
            name="imgUrl"
            placeholder="Paste Image URL..."
            value={formData.imgUrl}
            onChange={handleChange}
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
            />
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>

      <div className="statistics-section">
        <h2>My Statistics</h2>

        {!user ? (
          <div className="empty-state">
            <p>
              <strong>No posts created yet.</strong>
            </p>
          </div>
        ) : (
          <div className="trails-grid">
            {trails.map((trail) => (
              <div key={trail._id} className="trail-card">
                {trail.imgUrl && <img src={trail.imgUrl} alt={trail.title} />}
                <div className="trail-info">
                  <h3>{trail.title}</h3>
                  <p>{trail.description}</p>
                  <span className="trail-tag">{trail.tag}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

// import { useContext, useEffect, useState } from "react";
// import "./stylesheets/dashboard.css";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "./context/AuthContext";

// function Dashboard() {
//   const [trails, setTrails] = useState([]);
//   const navigate = useNavigate();
//   const { user, logout } = useContext(AuthContext);

//   useEffect(() => {
//     fetch("http://localhost:5000/api/trails")
//       .then((res) => res.json())
//       .then((data) => setTrails(data))
//       .catch((err) => console.error("Error fetching trails:", err));
//   }, []);

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         {user ? (
//           <>
//             <h1> Welcome {user.username}</h1>
//             <button className="logout-button" onClick={logout}>
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <h1>Welcome to TrailTracker</h1>
//             <div className="header-buttons">
//               <button
//                 className="login-button"
//                 onClick={() => navigate("/login")}
//               >
//                 Login
//               </button>
//               <button
//                 className="signup-button"
//                 onClick={() => navigate("/register")}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </>
//         )}
//       </header>

//       <div className="moments-section">
//         {!user ? (
//           <>
//             <h2>My Trail Moment</h2>
//             <div className="empty-state">
//               <p>
//                 <strong>
//                   You must login or create an account to make a post
//                 </strong>
//               </p>
//               <button
//                 className="login-button"
//                 onClick={() => navigate("/login")}
//               >
//                 Create a post
//               </button>
//             </div>
//           </>
//         ) : trails.length === 0 ? (
//           <>
//             <h2>My Trail Moment</h2>
//             <div className="empty-state">
//               <p>
//                 <strong>
//                   No posts created yet. Why not create a post while your at it?
//                 </strong>
//               </p>
//               <button
//                 className="login-button"
//                 onClick={() => navigate("/create-post")}
//               >
//                 Create post
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="section-header-row">
//               <h2>My Trail Moment</h2>
//               <button
//                 className="login-button"
//                 onClick={() => navigate("/create-post")}
//               >
//                 Create post
//               </button>
//             </div>
//             <div className="trails-grid">
//               {trails.map((trail) => (
//                 <div key={trail._id || trail.id} className="trail-card">
//                   {trail.imgUrl && <img src={trail.imgUrl} alt={trail.title} />}
//                   <h3>{trail.title}</h3>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <div className="statistics-section">
//         <h2>My Statistics</h2>

//         {!user ? (
//           <div className="empty-state">
//             <p>
//               <strong>You must login to view your statistics</strong>
//             </p>
//           </div>
//         ) : (
//           <div className="stats-grid">
//             <div className="stat-item">
//               <span className="stat-number">0</span>
//               <span className="stat-label">Trail visited</span>
//             </div>

//             <div className="stat-item">
//               <span className="stat-number">0</span>
//               <span className="stat-label">Trail Moments</span>
//             </div>

//             <div className="stat-item">
//               <span className="stat-number">0</span>
//               <span className="stat-label">Hours Hiked</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
