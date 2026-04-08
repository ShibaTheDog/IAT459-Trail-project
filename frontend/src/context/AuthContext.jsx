import { jwtDecode } from "jwt-decode";
import { createContext, useState } from "react";

// Create the Context object to be consumed by other components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. Initialize BOTH token and user immediately.
  // This stops the app from rendering twice on load!
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        return jwtDecode(storedToken);
      } catch (err) {
        // Now you are using the 'err' variable!
        console.error("Failed to decode token:", err);
        localStorage.removeItem("token"); // Wipe storage if the token is bad
        return null;
      }
    }
    return null;
  });

  // 2. Function to handle login (Updates both states instantly)
  function login(newToken) {
    localStorage.setItem("token", newToken); // Save to browser memory
    setToken(newToken); // Update token state
    setUser(jwtDecode(newToken)); // Decode and set user instantly!
  }

  // 3. Function to handle logout
  function logout() {
    localStorage.removeItem("token"); // Remove from browser memory
    setToken(null); // Reset state
    setUser(null);
  }

  // 4. Function to refresh user data from backend
  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to refresh user data");
      const freshUserData = await res.json();
      
      // Merge with existing JWT data (to keep id, role, etc.)
      setUser((prev) => ({ ...prev, ...freshUserData }));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }

  return (
    // We provide 'token' and 'user' (data)
    // and 'login', 'logout', and 'refreshUser' (functions) to the whole app
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}