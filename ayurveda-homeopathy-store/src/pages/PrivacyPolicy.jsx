import React from "react";
import {
    Leaf,
    ShieldCheck,
    Database,
    UserCheck,
    Mail,
    Phone,
    Lock,
    ArrowLeft,
    Info,
    CheckCircle2,
} from "lucide-react";

const Section = ({ icon: Icon, title, accent, children }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
        {/* Subtle gradient accent top-left */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-emerald-50 opacity-60 blur-2xl" />
        <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
                    <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-stone-900 sm:text-xl">{title}</h2>
            </div>
            {accent && (
                <p className="mb-4 text-sm font-medium text-emerald-700">{accent}</p>
            )}
            <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                {children}
            </div>
        </div>
    </div>
);

const BulletItem = ({ children }) => (
    <li className="flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>{children}</span>
    </li>
);

const PrivacyPolicy = ({ onNavigate }) => {
    const handleBack = (e) => {
        e.preventDefault();
        if (onNavigate) onNavigate("/");
        else window.history.back();
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-700/10 blur-2xl" />

                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-900/60 px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase backdrop-blur-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Your Privacy Matters</span>
                    </div>

                    {/* Brand logo row */}
                    <div className="mb-6 flex items-center justify-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-900/40">
                            <Leaf className="h-5 w-5 fill-emerald-100/20 text-emerald-100" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                            Malik's{" "}
                            <span className="text-emerald-400">Polyclinic</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-100/70 sm:text-base">
                        We are committed to protecting the personal information you share
                        with us. This policy explains what we collect, how we use it, and
                        how we keep it safe.
                    </p>

                    {/* Last updated pill */}
                    <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-200 backdrop-blur-sm">
                        <Info className="h-3.5 w-3.5" />
                        <span>Last updated: October 2026</span>
                    </div>
                </div>
            </div>

            {/* Back navigation */}
            <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
                <a
                    href="/"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                </a>
            </div>

            {/* Content Sections */}
            <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

                {/* 1. Information We Collect */}
                <Section icon={Database} title="Information We Collect">
                    <p>
                        We collect information you provide directly to us when you:
                    </p>
                    <ul className="mt-3 space-y-2">
                        <BulletItem>Create an account or make a purchase</BulletItem>
                        <BulletItem>Contact us for support</BulletItem>
                        <BulletItem>Subscribe to our newsletter</BulletItem>
                    </ul>

                    <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
                        <p className="mb-3 font-semibold text-stone-800">Personal Information:</p>
                        <ul className="space-y-2">
                            <BulletItem>Name and contact details</BulletItem>
                            <BulletItem>Email address</BulletItem>
                            <BulletItem>Phone number</BulletItem>
                            <BulletItem>Billing and shipping addresses</BulletItem>
                        </ul>
                    </div>
                </Section>

                {/* 2. How We Use Your Information */}
                <Section
                    icon={UserCheck}
                    title="How We Use Your Information"
                    accent="We use your information responsibly and only for the purposes listed below."
                >
                    <ul className="space-y-2">
                        <BulletItem>Process and fulfill your orders</BulletItem>
                        <BulletItem>Provide customer support</BulletItem>
                        <BulletItem>Send important account updates</BulletItem>
                        <BulletItem>Improve our services</BulletItem>
                    </ul>
                </Section>

                {/* 3. Data Protection */}
                <Section icon={Lock} title="Data Protection">
                    <p>
                        We implement industry-standard security measures to protect your
                        personal information against unauthorized access, alteration, or
                        disclosure. Our protective measures include:
                    </p>
                    <ul className="mt-3 space-y-2">
                        <BulletItem>Encrypted data storage and transmission (SSL/TLS)</BulletItem>
                        <BulletItem>Restricted internal access to personal data</BulletItem>
                        <BulletItem>Regular security audits and system reviews</BulletItem>
                        <BulletItem>Secure payment processing via verified UPI channels</BulletItem>
                    </ul>
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-amber-800">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <p className="text-xs leading-relaxed">
                            We do{" "}
                            <strong>not</strong> sell, trade, or rent your personal data to
                            third parties. Your information is used solely to operate and
                            improve Malik's Polyclinic services.
                        </p>
                    </div>
                </Section>

                {/* 4. Contact Us */}
                <Section icon={Mail} title="Contact Us">
                    <p>
                        Questions about this Privacy Policy? Our team is happy to help. Get
                        in touch with us through any of the channels below:
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Email card */}
                        <a
                            href="mailto:ahmedsaif121.sa@gmail.com"
                            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-stone-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    Email
                                </p>
                                <p className="mt-0.5 text-sm font-medium break-all">
                                    mustafeezshaikh88@gmail.com
                                </p>
                            </div>
                        </a>

                        {/* Phone card */}
                        <a
                            href="tel:9148663873"
                            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-stone-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    Phone
                                </p>
                                <p className="mt-0.5 text-sm font-medium">9148663873</p>
                            </div>
                        </a>
                    </div>
                </Section>

                {/* Footer note */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-5 text-center">
                    <p className="text-xs leading-relaxed text-emerald-700">
                        By using Malik's Polyclinic website and services, you agree to the
                        terms of this Privacy Policy. We may update this policy from time to
                        time — any changes will be posted on this page with an updated date.
                    </p>
                </div>

                {/* Bottom Back Button */}
                <div className="flex justify-center pb-4">
                    <a
                        href="/"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-800 active:bg-emerald-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Home</span>
                    </a>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
