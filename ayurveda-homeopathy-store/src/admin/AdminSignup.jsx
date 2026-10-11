import React, { useState } from "react";
import {
    Lock,
    Mail,
    User,
    Shield,
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
    Check,
    Building2,
    BadgeInfo,
} from "lucide-react";
import {
    useAuth,
    CLINIC_ROLES,
    CLINIC_ADMIN_SECRET_KEY,
} from "../context/AuthContext";

const AdminSignup = ({ onNavigate }) => {
    const { signUp, authError } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [clinicRole, setClinicRole] = useState(CLINIC_ROLES[0]);
    const [adminCode, setAdminCode] = useState(CLINIC_ADMIN_SECRET_KEY);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [termsAgreed, setTermsAgreed] = useState(true);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState("");
    const [signupSuccess, setSignupSuccess] = useState(null);

    // Password strength checks
    const hasMinLength = password.length >= 6;
    const hasMixedChars = /[A-Z]/.test(password) && /[0-9]/.test(password);
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");
        setSignupSuccess(null);

        // Validation
        if (!fullName.trim()) {
            setLocalError("Please enter your full name.");
            return;
        }
        if (!email.trim()) {
            setLocalError("Please enter a valid clinic email address.");
            return;
        }
        if (!adminCode.trim()) {
            setLocalError("Please enter the Clinic Security Passcode.");
            return;
        }
        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setLocalError("Passwords do not match. Please verify.");
            return;
        }
        if (!termsAgreed) {
            setLocalError("You must acknowledge the Healthcare Data Governance policy.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await signUp({
                fullName: fullName.trim(),
                email: email.trim(),
                clinicRole,
                adminCode: adminCode.trim(),
                password,
            });

            if (res.success) {
                setSignupSuccess({
                    needsEmailConfirmation: res.needsEmailConfirmation,
                    user: res.user,
                });

                // If auto-logged in, navigate to dashboard after brief pause
                if (!res.needsEmailConfirmation) {
                    setTimeout(() => {
                        onNavigate?.("/admin/dashboard");
                    }, 1200);
                }
            } else {
                setLocalError(res.error || "Unable to register admin account.");
            }
        } catch (err) {
            setLocalError(err?.message || "Registration failed due to a server error.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0c0b] font-sans text-stone-100 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Background Neon Elements */}
            <div className="pointer-events-none absolute -top-40 right-1/4 h-[560px] w-[900px] rounded-full bg-gradient-to-b from-emerald-600/15 via-teal-900/10 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-950/30 blur-3xl" />
            <div className="pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-teal-950/20 blur-3xl" />

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
                    <span className="hidden sm:inline">Already registered?</span>
                    <button
                        type="button"
                        onClick={() => onNavigate?.("/admin/login")}
                        className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline"
                    >
                        Sign In to Portal
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 shadow-xl shadow-emerald-950/50 ring-1 ring-white/20">
                            <Leaf className="h-7 w-7 text-emerald-50" />
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Hospital & Staff Onboarding</span>
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Register Clinic Administrator
                        </h1>
                        <p className="mt-2 text-xs text-stone-400 sm:text-sm">
                            Create an authorized medical practitioner or admin profile for Malik's Polyclinic
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-3xl border border-white/[0.09] bg-neutral-900/85 p-6 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:p-8">
                        {/* Success Banner */}
                        {signupSuccess && (
                            <div
                                role="status"
                                className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200"
                            >
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Admin Registration Successful!
                                        </h3>
                                        {signupSuccess.needsEmailConfirmation ? (
                                            <div className="mt-1 space-y-2 text-xs text-emerald-100/90 leading-relaxed">
                                                <p>
                                                    A confirmation link has been sent to{" "}
                                                    <strong className="text-white">{email}</strong>.
                                                    Please verify your email to enable complete cloud synchronization.
                                                </p>
                                                <p>
                                                    You can now log in to your admin workspace:
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => onNavigate?.("/admin/login")}
                                                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                                                >
                                                    <span>Go to Admin Login</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-xs text-emerald-100/90">
                                                Your account has been authenticated. Redirecting directly to the admin dashboard...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Banner */}
                        {(localError || authError) && (
                            <div
                                role="alert"
                                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] p-3.5 text-xs text-rose-200"
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                                <span>{localError || authError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name & Role Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Full Name */}
                                <div>
                                    <label
                                        htmlFor="admin-fullname"
                                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                                    >
                                        Full Name <span className="text-emerald-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <User
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="admin-fullname"
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="e.g. Dr. Mozim Malik"
                                            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 text-xs text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Clinic Role */}
                                <div>
                                    <label
                                        htmlFor="admin-role"
                                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                                    >
                                        Clinic Designation / Role
                                    </label>
                                    <div className="relative">
                                        <Building2
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <select
                                            id="admin-role"
                                            value={clinicRole}
                                            onChange={(e) => setClinicRole(e.target.value)}
                                            className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950 pl-10 pr-3 text-xs text-stone-200 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            {CLINIC_ROLES.map((role) => (
                                                <option key={role} value={role} className="bg-neutral-900 text-white">
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Email & Security Key Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="admin-signup-email"
                                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                                    >
                                        Clinic Email Address <span className="text-emerald-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="admin-signup-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. doctor@malikclinic.com"
                                            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 text-xs text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Security Passcode */}
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label
                                            htmlFor="admin-code"
                                            className="block text-xs font-semibold text-stone-300"
                                        >
                                            Clinic Security Key <span className="text-emerald-400">*</span>
                                        </label>
                                        <span className="text-[10px] text-emerald-400 font-mono">
                                            Key: {CLINIC_ADMIN_SECRET_KEY}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <KeyRound
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="admin-code"
                                            type="text"
                                            required
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            placeholder={CLINIC_ADMIN_SECRET_KEY}
                                            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3 text-xs font-mono uppercase text-emerald-300 placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password & Confirm Password Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="admin-signup-password"
                                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                                    >
                                        Password <span className="text-emerald-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="admin-signup-password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
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

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="admin-confirm-password"
                                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                                    >
                                        Confirm Password <span className="text-emerald-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="admin-confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat password"
                                            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-xs text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-white"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Quality Badges */}
                            {password && (
                                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-black/30 p-2.5 text-[11px]">
                                    <span
                                        className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : "text-stone-500"
                                            }`}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>6+ characters</span>
                                    </span>
                                    <span
                                        className={`flex items-center gap-1 ${hasMixedChars ? "text-emerald-400" : "text-stone-500"
                                            }`}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Letters & numbers</span>
                                    </span>
                                    {confirmPassword && (
                                        <span
                                            className={`flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-rose-400"
                                                }`}
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            <span>{passwordsMatch ? "Passwords match" : "Does not match"}</span>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Data Compliance Checkbox */}
                            <div className="pt-2">
                                <label className="flex cursor-pointer items-start gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={termsAgreed}
                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 accent-emerald-500"
                                    />
                                    <span className="text-xs text-stone-400 leading-relaxed">
                                        I confirm that I am an authorized healthcare administrator at Malik's Polyclinic, and agree to handle patient records, prescriptions, and pharmacy data in compliance with medical confidentiality standards.
                                    </span>
                                </label>
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
                                        <span>Registering Admin Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        <span>Create Administrator Account</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Separator & Switch to Login */}
                        <div className="mt-6 border-t border-white/[0.08] pt-5 text-center">
                            <p className="text-xs text-stone-400">
                                Already have an authorized admin account?{" "}
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.("/admin/login")}
                                    className="font-bold text-emerald-400 underline-offset-2 transition hover:text-emerald-300 hover:underline"
                                >
                                    Sign In Here
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
        </div>
    );
};

export default AdminSignup;
