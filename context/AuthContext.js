"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      } else {
        // Refresh failed, clear auth state
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (storedToken) {
        // Verify token by fetching user
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setAccessToken(storedToken);
          } else if (response.status === 401) {
            // Token expired, try to refresh
            await refreshToken();
          }
        } catch (error) {
          console.error("Auth init error:", error);
          await refreshToken();
        }
      } else {
        // No stored token, try to refresh
        await refreshToken();
      }

      setLoading(false);
    };

    initAuth();
  }, [refreshToken]);

  // Set up token refresh interval
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token 1 minute before it expires (14 minutes)
    const refreshInterval = setInterval(
      () => {
        refreshToken();
      },
      14 * 60 * 1000,
    );

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshToken]);

  // Login function
  const login = async (email, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      // Force navigation with full page reload to ensure middleware picks up cookies
      window.location.href = "/dashboard";
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  };

  // Register function
  const register = async (email, password, name) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    // Force navigation with full page reload
    window.location.href = "/login";
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error };
    }
  };

  // Authenticated fetch function
  const authFetch = useCallback(
    async (url, options = {}) => {
      let token = accessToken;

      // Try to refresh if no token
      if (!token) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Not authenticated");
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      // If unauthorized, try to refresh and retry
      if (response.status === 401) {
        token = await refreshToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return response;
    },
    [accessToken, refreshToken],
  );

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    authFetch,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
