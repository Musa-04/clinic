import React from "react";
import {
    ArrowRight,
    Stethoscope,
    Sparkles,
    ShieldCheck,
    HeartHandshake,
    Leaf,
} from "lucide-react";

import heroImage from "../assets/Modern Muslim Doctor Couple Hero Banner.png";

const Hero = () => {
    return (
        <section
            id="home"
            className="relative w-full max-w-full overflow-hidden bg-linear-to-b from-neutral-950 via-stone-950 to-black py-8 sm:py-12 lg:py-16"
        >
            {/* Decorative Background Glows */}
            <div className="pointer-events-none absolute right-0 top-0 z-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl sm:h-96 sm:w-96" />

            <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-64 w-64 rounded-full bg-emerald-700/10 blur-3xl sm:h-80 sm:w-80" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid min-w-0 grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">

                    {/* =====================================================
              LEFT SIDE - HERO CONTENT
          ===================================================== */}
                    <div className="flex min-w-0 max-w-full flex-col items-start space-y-4 text-left sm:space-y-6 lg:col-span-7">

                        {/* Badge */}
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 shadow-sm sm:text-sm">
                            <Sparkles
                                className="h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4"
                                fill="currentColor"
                                fillOpacity={0.25}
                            />

                            <span className="truncate">
                                Ayurvedic & Homeopathic Polyclinic
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="max-w-full wrap-break-word text-3xl font-extrabold leading-[1.18] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                            Malik's{" "}
                            <span className="bg-linear-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Polyclinic
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-base font-bold leading-snug tracking-tight text-emerald-200 sm:text-xl lg:text-2xl">
                            Natural Care. Better Health. Personalized Treatment.
                        </p>

                        {/* Description */}
                        <p className="max-w-2xl text-sm font-normal leading-relaxed text-stone-300 sm:text-base lg:text-lg">
                            We provide Homeopathic and Ayurvedic healthcare with a focus on
                            natural, personalized and holistic treatment.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex w-full flex-col items-stretch gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">

                            {/* Explore Medicines */}
                            <a
                                href="#medicines"
                                className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3.5 text-center text-base font-semibold text-white shadow-md shadow-emerald-950/40 transition-all duration-200 hover:bg-emerald-500 active:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:px-8 sm:py-4"
                            >
                                <span>Explore Medicines</span>

                                <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                            </a>

                            {/* Contact Doctor */}
                            <a
                                href="#doctors"
                                className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/35 bg-white/5 px-5 py-3.5 text-center text-base font-semibold text-emerald-100 shadow-sm transition-all duration-200 hover:border-emerald-300/60 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:px-8 sm:py-4"
                            >
                                <Stethoscope className="h-4 w-4 shrink-0 text-emerald-300 sm:h-5 sm:w-5" />

                                <span>Contact Doctor</span>
                            </a>
                        </div>

                        {/* Trust Highlights */}
                        <div className="grid w-full grid-cols-1 gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-3 sm:gap-3 lg:pt-6">

                            {/* Trusted Care */}
                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-2.5 sm:border-none sm:bg-transparent sm:p-1">
                                <div className="shrink-0 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-2 text-emerald-300">
                                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-100 sm:text-sm">
                                        Trusted Care
                                    </p>

                                    <p className="text-[11px] text-stone-400 sm:text-xs">
                                        Professional Healthcare
                                    </p>
                                </div>
                            </div>

                            {/* Qualified Doctors */}
                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-2.5 sm:border-none sm:bg-transparent sm:p-1">
                                <div className="shrink-0 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-2 text-emerald-300">
                                    <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-100 sm:text-sm">
                                        Qualified Doctors
                                    </p>

                                    <p className="text-[11px] text-stone-400 sm:text-xs">
                                        BHMS & BAMS
                                    </p>
                                </div>
                            </div>

                            {/* Holistic Care */}
                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-2.5 sm:border-none sm:bg-transparent sm:p-1">
                                <div className="shrink-0 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-2 text-emerald-300">
                                    <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-100 sm:text-sm">
                                        Holistic Care
                                    </p>

                                    <p className="text-[11px] text-stone-400 sm:text-xs">
                                        Natural Approach
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* =====================================================
              RIGHT SIDE - HERO IMAGE
          ===================================================== */}
                    <div className="relative mt-1 flex w-full min-w-0 max-w-full justify-center lg:col-span-5 lg:mt-0">

                        {/* Soft Glow Behind Image */}
                        <div className="absolute inset-4 rounded-4xl bg-linear-to-tr from-emerald-500/20 via-emerald-400/10 to-transparent blur-2xl" />

                        {/* Image Container */}
                        <div className="relative w-full max-w-md lg:max-w-none">

                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 p-1.5 shadow-xl shadow-emerald-950/30 backdrop-blur-sm sm:p-3">

                                {/* Doctor Couple Image */}
                                <div className="relative overflow-hidden rounded-2xl bg-neutral-900">

                                    <img
                                        src={heroImage}
                                        alt="Doctors at Malik's Polyclinic"
                                        className="block h-auto w-full object-contain object-center"
                                    />

                                    {/* Soft Bottom Gradient */}
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/20 to-transparent" />

                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;