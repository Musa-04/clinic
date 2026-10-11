import React, { useState } from "react";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    Leaf,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    ArrowLeft,
    Activity,
    Send,
    X,
} from "lucide-react";
import { useAuth, DEMO_ADMIN_USER } from "../context/AuthContext";

const AdminLogin = ({ onNavigate }) => {
    const { login, loginDemo, authError, resetPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    // Forgot password modal state
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotStatus, setForgotStatus] = useState({ type: "", message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        setToastMessage("");

        if (!email.trim()) {
            setLocalError("Please enter your admin email address.");
            return;
        }
        if (!password) {
            setLocalError("Please enter your password.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await login({
                email: email.trim(),
                password,
                rememberMe,
            });

            if (res.success) {
                setToastMessage("Welcome back! Redirecting to admin dashboard...");
                setTimeout(() => {
                    onNavigate?.("/admin/dashboard");
                }, 600);
            } else {
                setLocalError(res.error || "Authentication failed. Please check credentials.");
            }
        } catch (err) {
            setLocalError(err?.message || "An unexpected error occurred during login.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickDemoLogin = async () => {
        setSubmitting(true);
        setLocalError("");
        try {
            loginDemo();
            setToastMessage("Signed in as Demo Administrator! Launching workspace...");
            setTimeout(() => {
                onNavigate?.("/admin/dashboard");
            }, 500);
        } catch {
            setLocalError("Could not initialize demo login.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFillDemoCredentials = () => {
        setEmail(DEMO_ADMIN_USER.email);
        setPassword("Admin@2026");
        setLocalError("");
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            setForgotStatus({
                type: "error",
                message: "Please enter your registered admin email address.",
            });
            return;
        }

        setForgotSubmitting(true);
        setForgotStatus({ type: "", message: "" });
        try {
            const res = await resetPassword(forgotEmail);
            if (res.success) {
                setForgotStatus({
                    type: "success",
                    message:
                        "Password reset link has been dispatched to your email. Check your inbox.",
                });
            } else {
                setForgotStatus({
                    type: "error",
                    message: res.error || "Unable to send reset email. Verify your address.",
                });
            }
        } catch {
            setForgotStatus({
                type: "error",
                message: "Network error sending reset email.",
            });
        } finally {
            setForgotSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0c0b] font-sans text-stone-100 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Background Decorative Mesh & Neon Glows */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-600/15 via-teal-900/10 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-950/30 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-950/20 blur-3xl" />

            {/* Top Bar Navigation */}
            <header className="relative z-10 flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-8">
                <button
                    type="button"
                    onClick={() => onNavigate?.("/")}
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-stone-300 backdrop-blur-md transition hover:border-emerald-500/30 hover:bg-white/[0.06] hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back to Clinic Store</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="hidden sm:inline">Need an admin account?</span>
                    <button
                        type="button"
                        onClick={() => onNavigate?.("/admin/signup")}
                        className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline"
                    >
                        Create Admin Account
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Brand Header */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 shadow-xl shadow-emerald-950/50 ring-1 ring-white/20">
                            <Leaf className="h-7 w-7 text-emerald-50" />
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Admin Control Center</span>
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Sign In to Admin Portal
                        </h1>
                        <p className="mt-2 text-xs text-stone-400 sm:text-sm">
                            Malik's Polyclinic & Ayurvedic Pharmacy Operations
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="rounded-3xl border border-white/[0.09] bg-neutral-900/85 p-6 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:p-8">
                        {/* Quick Demo Access Callout */}
                        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 p-3.5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-200">
                                        Instant Demo Admin Access
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFillDemoCredentials}
                                    className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                                >
                                    Auto-fill
                                </button>
                            </div>
                            <p className="mt-1.5 text-[11px] text-stone-300 leading-relaxed">
                                Want to test immediately? Click below to enter the full admin panel with Dr. Mozim Malik's credentials.
                            </p>
                            <button
                                type="button"
                                onClick={handleQuickDemoLogin}
                                disabled={submitting}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-50"
                            >
                                <Activity className="h-3.5 w-3.5" />
                                <span>One-Click Demo Admin Login</span>
                            </button>
                        </div>

                        {/* Error or Success Feedback */}
                        {(localError || authError) && (
                            <div
                                role="alert"
                                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] p-3.5 text-xs text-rose-200"
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                                <span>{localError || authError}</span>
                            </div>
                        )}

                        {toastMessage && (
                            <div
                                role="status"
                                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-3.5 text-xs text-emerald-200"
                            >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{toastMessage}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="admin-email"
                                    className="mb-1.5 block text-xs font-semibold text-stone-300"
                                >
                                    Admin Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setLocalError("");
                                        }}
                                        placeholder="e.g. admin@malikspolyclinic.com"
                                        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 text-xs text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="admin-password"
                                        className="block text-xs font-semibold text-stone-300"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForgotStatus({ type: "", message: "" });
                                            setForgotEmail(email);
                                            setForgotModalOpen(true);
                                        }}
                                        className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setLocalError("");
                                        }}
                                        placeholder="Enter your admin password"
                                        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-xs text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-white"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/40 accent-emerald-500"
                                    />
                                    <span className="text-xs text-stone-300">Remember this device</span>
                                </label>
                                <span className="text-[10px] text-stone-500 font-medium">
                                    256-Bit SSL Secured
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Verifying Credentials...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Admin Workspace</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Separator & Switch to Signup */}
                        <div className="mt-6 border-t border-white/[0.08] pt-5 text-center">
                            <p className="text-xs text-stone-400">
                                New authorized hospital administrator?{" "}
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.("/admin/signup")}
                                    className="font-bold text-emerald-400 underline-offset-2 transition hover:text-emerald-300 hover:underline"
                                >
                                    Register New Admin
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Security Footnote */}
                    <div className="mt-6 text-center text-[11px] text-stone-500">
                        <p>
                            Protected Clinical Network · Authorized Medical Personnel Only
                        </p>
                        <p className="mt-1">
                            Malik's Polyclinic &copy; {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

            {/* Forgot Password Modal */}
            {forgotModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setForgotModalOpen(false);
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
                                    <p className="text-xs text-stone-400">
                                        Receive a secure password reset link
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForgotModalOpen(false)}
                                className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
                            {forgotStatus.message && (
                                <div
                                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${forgotStatus.type === "success"
                                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                            : "border-rose-400/20 bg-rose-500/10 text-rose-200"
                                        }`}
                                >
                                    {forgotStatus.type === "success" ? (
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                                    )}
                                    <span>{forgotStatus.message}</span>
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-stone-300">
                                    Admin Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="admin@malikspolyclinic.com"
                                    className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setForgotModalOpen(false)}
                                    className="h-10 rounded-xl border border-white/10 px-4 text-xs font-semibold text-stone-300 transition hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotSubmitting}
                                    className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>{forgotSubmitting ? "Sending..." : "Send Reset Link"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogin;
