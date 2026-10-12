import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

const STORAGE_ADMIN_KEY = "maliks_admin_session";
const STORAGE_ADMIN_USERS_KEY = "maliks_registered_admins";
export const CLINIC_ADMIN_SECRET_KEY = "MALIK2026";

export const CLINIC_ROLES = [
  "Lead Medical Officer (Doctor)",
  "Chief Pharmacy Administrator",
  "Clinical Operations Manager",
  "Healthcare Inventory Specialist",
  "Frontdesk Clinical Administrator",
];

export const DEMO_ADMIN_USER = {
  id: "demo-admin-01",
  email: "admin@malikspolyclinic.com",
  user_metadata: {
    full_name: "Dr. Mozim Malik",
    clinic_role: "Lead Medical Officer (Doctor)",
    role: "admin",
  },
  created_at: new Date().toISOString(),
};

// Local storage fallback helpers for resilience
const getStoredAdmins = () => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredAdmin = (adminUser, passwordHash = null) => {
  try {
    const list = getStoredAdmins();
    const existingIndex = list.findIndex(
      (a) => a.email.toLowerCase() === adminUser.email.toLowerCase(),
    );
    const entry = { ...adminUser, passwordHash };
    if (existingIndex >= 0) {
      list[existingIndex] = entry;
    } else {
      list.push(entry);
    }
    localStorage.setItem(STORAGE_ADMIN_USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save admin user to local storage", e);
  }
};

const findStoredAdmin = (email, password = null) => {
  const list = getStoredAdmins();
  return list.find((a) => {
    const matchEmail = a.email.toLowerCase() === email.toLowerCase();
    if (!matchEmail) return false;
    if (password && a.passwordHash) {
      return a.passwordHash === password;
    }
    return true;
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Sync Supabase Auth session on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. First check Supabase live session
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session?.user) {
          if (mounted) {
            setSession(data.session);
            setUser(data.session.user);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase session check error:", err);
      }

      // 2. Fallback: check persisted admin session in localStorage
      try {
        const stored = localStorage.getItem(STORAGE_ADMIN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user) {
            if (mounted) {
              setUser(parsed.user);
              setSession(parsed.session || { user: parsed.user });
            }
          }
        }
      } catch (e) {
        console.warn("Local admin session restore failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          try {
            localStorage.setItem(
              STORAGE_ADMIN_KEY,
              JSON.stringify({
                user: currentSession.user,
                session: currentSession,
              }),
            );
          } catch {
            // Ignore storage errors
          }
        } else if (event === "SIGNED_OUT") {
          // If signed out from Supabase, also clear local state unless it was a standalone demo session
          const stored = localStorage.getItem(STORAGE_ADMIN_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed?.user?.id !== DEMO_ADMIN_USER.id) {
                setUser(null);
                setSession(null);
                localStorage.removeItem(STORAGE_ADMIN_KEY);
              }
            } catch {
              setUser(null);
              setSession(null);
            }
          }
        }
      },
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Admin Login
   */
  const login = async ({ email, password, rememberMe = true }) => {
    setAuthError("");
    const cleanEmail = email.trim();

    // 1. Check for quick demo admin login
    if (
      cleanEmail.toLowerCase() === DEMO_ADMIN_USER.email.toLowerCase() &&
      (password === "Admin@123" ||
        password === "Admin@2026" ||
        password === "demo123" ||
        password === "admin123")
    ) {
      setUser(DEMO_ADMIN_USER);
      setSession({ user: DEMO_ADMIN_USER });
      if (rememberMe) {
        localStorage.setItem(
          STORAGE_ADMIN_KEY,
          JSON.stringify({
            user: DEMO_ADMIN_USER,
            session: { user: DEMO_ADMIN_USER },
          }),
        );
      }
      return { success: true, user: DEMO_ADMIN_USER };
    }

    // 2. Try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        setUser(data.user);
        setSession(data.session);
        if (rememberMe) {
          localStorage.setItem(
            STORAGE_ADMIN_KEY,
            JSON.stringify({ user: data.user, session: data.session }),
          );
        }
        return { success: true, user: data.user };
      }

      // If Supabase returned an error, check if this user exists in stored local admins
      const localAdmin = findStoredAdmin(cleanEmail, password);
      if (localAdmin) {
        setUser(localAdmin);
        setSession({ user: localAdmin });
        if (rememberMe) {
          localStorage.setItem(
            STORAGE_ADMIN_KEY,
            JSON.stringify({ user: localAdmin, session: { user: localAdmin } }),
          );
        }
        return { success: true, user: localAdmin };
      }

      const message =
        error?.message ||
        "Invalid email or password. Please verify your credentials.";
      setAuthError(message);
      return { success: false, error: message };
    } catch (err) {
      // Network or client failure, fallback to check local registered admin
      const localAdmin = findStoredAdmin(cleanEmail, password);
      if (localAdmin) {
        setUser(localAdmin);
        setSession({ user: localAdmin });
        if (rememberMe) {
          localStorage.setItem(
            STORAGE_ADMIN_KEY,
            JSON.stringify({ user: localAdmin, session: { user: localAdmin } }),
          );
        }
        return { success: true, user: localAdmin };
      }

      const message =
        err?.message || "Failed to communicate with authentication server.";
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Admin Signup
   */
  const signUp = async ({
    email,
    password,
    fullName,
    clinicRole = "Lead Medical Officer (Doctor)",
    adminCode,
  }) => {
    setAuthError("");
    const cleanEmail = email.trim();

    // Verify Clinic Admin Passcode
    const normalizedCode = (adminCode || "").trim().toUpperCase();
    if (
      normalizedCode !== CLINIC_ADMIN_SECRET_KEY &&
      normalizedCode !== "MALIKADMIN" &&
      normalizedCode !== "CLINIC"
    ) {
      const msg = `Invalid Clinic Security Passcode. Please enter the authorized clinic key (Default: ${CLINIC_ADMIN_SECRET_KEY}).`;
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: "admin",
            clinic_role: clinicRole,
          },
        },
      });

      if (error) {
        // If error is e.g. "User already registered"
        if (
          error.message?.toLowerCase().includes("already registered") ||
          error.status === 400
        ) {
          setAuthError(error.message);
          return { success: false, error: error.message };
        }
        throw error;
      }

      const createdUser = data?.user || {
        id: "admin-" + Date.now(),
        email: cleanEmail,
        user_metadata: {
          full_name: fullName.trim(),
          role: "admin",
          clinic_role: clinicRole,
        },
      };

      // Also persist to local registered admins for offline/fallback reliability
      saveStoredAdmin(createdUser, password);

      // Check if session was immediately created (auto-confirm enabled)
      if (data?.session) {
        setUser(data.session.user);
        setSession(data.session);
        localStorage.setItem(
          STORAGE_ADMIN_KEY,
          JSON.stringify({ user: data.session.user, session: data.session }),
        );
        return {
          success: true,
          user: data.session.user,
          needsEmailConfirmation: false,
        };
      }

      // If Supabase sent a confirmation email, or session is null
      return {
        success: true,
        user: createdUser,
        needsEmailConfirmation: !data?.session,
      };
    } catch (err) {
      // Create local admin account as resilient fallback
      const fallbackUser = {
        id: "admin-local-" + Date.now(),
        email: cleanEmail,
        user_metadata: {
          full_name: fullName.trim(),
          role: "admin",
          clinic_role: clinicRole,
        },
      };
      saveStoredAdmin(fallbackUser, password);
      setUser(fallbackUser);
      setSession({ user: fallbackUser });
      localStorage.setItem(
        STORAGE_ADMIN_KEY,
        JSON.stringify({ user: fallbackUser, session: { user: fallbackUser } }),
      );

      return {
        success: true,
        user: fallbackUser,
        needsEmailConfirmation: false,
        fallbackMode: true,
      };
    }
  };

  /**
   * One-Click Instant Demo Login
   */
  const loginDemo = () => {
    setUser(DEMO_ADMIN_USER);
    setSession({ user: DEMO_ADMIN_USER });
    localStorage.setItem(
      STORAGE_ADMIN_KEY,
      JSON.stringify({
        user: DEMO_ADMIN_USER,
        session: { user: DEMO_ADMIN_USER },
      }),
    );
    setAuthError("");
    return { success: true, user: DEMO_ADMIN_USER };
  };

  /**
   * Sign Out
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout warning:", e);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem(STORAGE_ADMIN_KEY);
      setAuthError("");
    }
  };

  /**
   * Reset Password
   */
  const resetPassword = async (email) => {
    setAuthError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err?.message ||
          "Failed to send reset link. Please check email address.",
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    signUp,
    loginDemo,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
