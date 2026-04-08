import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext();

function safeDecodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

function getStoredUser() {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      localStorage.removeItem("user");
    }
  }

  const storedToken = localStorage.getItem("token");
  if (!storedToken) return null;

  const decoded = safeDecodeToken(storedToken);
  if (!decoded) {
    localStorage.removeItem("token");
    return null;
  }

  return decoded;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(getStoredUser);
  const [authChecked, setAuthChecked] = useState(
    !localStorage.getItem("token")
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setAuthChecked(true);
  }, []);

  const login = useCallback((newToken, newUser = null) => {
    localStorage.setItem("token", newToken);

    const resolvedUser = newUser || safeDecodeToken(newToken);

    if (resolvedUser) {
      localStorage.setItem("user", JSON.stringify(resolvedUser));
      setUser(resolvedUser);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }

    setToken(newToken);
    setAuthChecked(true);
  }, []);

  const validateSession = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setAuthChecked(true);
      setToken(null);
      setUser(null);
      return false;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const contentType = res.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok && data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(currentToken);
        setUser(data.user);
        setAuthChecked(true);
        return true;
      }

      if (res.status === 401 || res.status === 403) {
        logout();
        return false;
      }

      setAuthChecked(true);
      return false;
    } catch (err) {
      console.error("Session validation failed:", err);
      setAuthChecked(true);
      return false;
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }

    validateSession();

    const intervalId = setInterval(() => {
      validateSession();
    }, 15000);

    function handleFocus() {
      validateSession();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        validateSession();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, validateSession]);

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

  const value = useMemo(
    () => ({
      token,
      user,
      authChecked,
      login,
      logout,
      validateSession,
    }),
    [token, user, authChecked, login, logout, validateSession, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}