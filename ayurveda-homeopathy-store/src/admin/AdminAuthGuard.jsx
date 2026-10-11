import React, { useEffect } from "react";
import { ShieldCheck, LogOut, Leaf, UserCheck, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminAuthGuard = ({ children, onNavigate }) => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      if (onNavigate) {
        onNavigate("/admin/login");
      } else {
        window.history.pushState({}, "", "/admin/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
  }, [loading, isAuthenticated, onNavigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0c0b] text-stone-100">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 shadow-xl shadow-emerald-950/60 ring-1 ring-white/20">
          <Leaf className="h-8 w-8 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          <Activity className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Verifying Admin Authorization...</span>
        </div>
        <p className="mt-2 text-xs text-stone-500">Malik's Polyclinic Admin Portal</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const adminName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Administrator";
  const adminRole =
    user?.user_metadata?.clinic_role ||
    user?.user_metadata?.role ||
    "Authorized Clinic Staff";

  const handleSignOut = async () => {
    await logout();
    if (onNavigate) {
      onNavigate("/admin/login");
    } else {
      window.history.pushState({}, "", "/admin/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <>
      {/* Verified Admin Security Banner */}
      <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-emerald-950/80 px-4 py-2 text-emerald-100 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 text-[11px] leading-5 sm:text-xs">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <p className="min-w-0 truncate">
              <span className="font-bold text-emerald-300">Active Admin Session</span>
              <span className="mx-2 text-emerald-500/40" aria-hidden="true">•</span>
              <span className="text-stone-300">{adminName}</span>
              <span className="mx-1 text-stone-600">({adminRole})</span>
              <span className="hidden md:inline text-stone-500">
                {" "}· 256-Bit SSL Encrypted Clinical Session
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <UserCheck className="h-3 w-3" />
              <span>Verified Identity</span>
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-stone-300 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

export default AdminAuthGuard;