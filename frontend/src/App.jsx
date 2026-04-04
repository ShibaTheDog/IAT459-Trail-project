import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import TrailForm from "./TrailForm";
import TrailDetail from "./TrailDetail";
import TrailResult from "./TrailResult";
import Profile from "./Profile";
import AdminModeration from "./adminModeration";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import Navbar from "./Navbar";

function AppContent() {
  const location = useLocation();
  const hideNavbar = ["/register", "/login", "/profile"].includes(
    location.pathname,
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div style={!hideNavbar ? { paddingTop: "56px" } : {}}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trail/:id" element={<TrailDetail />} />
          <Route path="/trail-result/:id" element={<TrailResult />} />
          <Route path="/profile" element={<Profile />} />{" "}
          {/* probably needs to be protected or something*/}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <TrailForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <ProtectedAdminRoute>
                <AdminModeration />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
