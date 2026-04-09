// used to protecte routes that require authentication on user/admin
// if user is not logged in redirected to login 

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, authChecked } = useContext(AuthContext);

  if (!authChecked) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;