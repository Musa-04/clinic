import { STORAGE_ADMIN_KEY } from "../context/AuthContext";

export const getCurrentAdminSession = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_ADMIN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.user ? parsed.user : null;
  } catch {
    return null;
  }
};

export const validateAdminIdentity = (providedIdentity) => {
  const currentAdmin = getCurrentAdminSession();
  
  if (!currentAdmin) {
    return {
      valid: false,
      error: "No active admin session. Please log in to the admin panel.",
      code: "NO_SESSION",
    };
  }

  if (!providedIdentity) {
    return {
      valid: false,
      error: "Admin identity is required for this action.",
      code: "MISSING_IDENTITY",
    };
  }

  const currentId = currentAdmin.id || currentAdmin.email;
  const providedId = providedIdentity.id || providedIdentity.email || providedIdentity;

  if (String(currentId).toLowerCase() !== String(providedId).toLowerCase()) {
    return {
      valid: false,
      error: "Admin identity does not match current session. Action denied.",
      code: "IDENTITY_MISMATCH",
    };
  }

  return {
    valid: true,
    admin: currentAdmin,
  };
};

export const requireAdminAuth = (providedIdentity) => {
  const result = validateAdminIdentity(providedIdentity);
  if (!result.valid) {
    const error = new Error(result.error);
    error.code = result.code;
    throw error;
  }
  return result.admin;
};

export const getAdminIdentityForLogging = (providedIdentity) => {
  const currentAdmin = getCurrentAdminSession();
  if (currentAdmin) {
    return currentAdmin.id || currentAdmin.email;
  }
  return providedIdentity || "unknown_admin";
};