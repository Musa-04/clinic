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
            className="relative w-full max-w-full overflow-hidden bg-gradient-to-b from-emerald-50/70 via-stone-50 to-white pt-6 pb-16 sm:pt-12 sm:pb-24"
        >
            {/* Decorative Background Glows */}
            <div className="pointer-events-none absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl sm:h-96 sm:w-96" />

            <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-amber-100/30 blur-2xl sm:h-80 sm:w-80" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">

                    {/* =====================================================
              LEFT SIDE - HERO CONTENT
          ===================================================== */}
                    <div className="flex max-w-full flex-col items-start space-y-4 text-left sm:space-y-6 lg:col-span-7">

                        {/* Badge */}
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm sm:text-sm">
                            <Sparkles
                                className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4"
                                fill="currentColor"
                                fillOpacity={0.25}
                            />

                            <span className="truncate">
                                Ayurvedic & Homeopathic Polyclinic
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="break-words text-3xl font-extrabold leading-[1.18] tracking-tight text-stone-900 sm:text-4xl md:text-5xl lg:text-6xl">
                            Malik's{" "}
                            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
                                Polyclinic
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg font-bold leading-snug tracking-tight text-emerald-900 sm:text-xl lg:text-2xl">
                            Natural Care. Better Health. Personalized Treatment.
                        </p>

                        {/* Description */}
                        <p className="max-w-2xl text-sm font-normal leading-relaxed text-stone-600 sm:text-base lg:text-lg">
                            We provide Homeopathic and Ayurvedic healthcare with a focus on
                            natural, personalized and holistic treatment.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">

                            {/* Explore Medicines */}
                            <a
                                href="#medicines"
                                className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl bg-emerald-700 px-6 py-3.5 text-center text-base font-semibold text-white shadow-md shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-800 active:bg-emerald-900 sm:px-8 sm:py-4"
                            >
                                <span>Explore Medicines</span>

                                <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                            </a>

                            {/* Contact Doctor */}
                            <a
                                href="#doctors"
                                className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl border-2 border-emerald-700/25 bg-white px-6 py-3.5 text-center text-base font-semibold text-emerald-900 shadow-sm transition-all duration-200 hover:border-emerald-700/50 hover:bg-emerald-50/60 sm:px-8 sm:py-4"
                            >
                                <Stethoscope className="h-4 w-4 shrink-0 text-emerald-700 sm:h-5 sm:w-5" />

                                <span>Contact Doctor</span>
                            </a>
                        </div>

                        {/* Trust Highlights */}
                        <div className="grid w-full grid-cols-1 gap-3 border-t border-stone-200/80 pt-6 sm:grid-cols-3 sm:gap-4">

                            {/* Trusted Care */}
                            <div className="flex items-center gap-3 rounded-xl border border-stone-200/50 bg-white/60 p-2.5 sm:border-none sm:bg-transparent">
                                <div className="shrink-0 rounded-xl bg-emerald-100 p-2 text-emerald-800">
                                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-900 sm:text-sm">
                                        Trusted Care
                                    </p>

                                    <p className="text-[11px] text-stone-500 sm:text-xs">
                                        Professional Healthcare
                                    </p>
                                </div>
                            </div>

                            {/* Qualified Doctors */}
                            <div className="flex items-center gap-3 rounded-xl border border-stone-200/50 bg-white/60 p-2.5 sm:border-none sm:bg-transparent">
                                <div className="shrink-0 rounded-xl bg-teal-100 p-2 text-teal-800">
                                    <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-900 sm:text-sm">
                                        Qualified Doctors
                                    </p>

                                    <p className="text-[11px] text-stone-500 sm:text-xs">
                                        BHMS & BAMS
                                    </p>
                                </div>
                            </div>

                            {/* Holistic Care */}
                            <div className="flex items-center gap-3 rounded-xl border border-stone-200/50 bg-white/60 p-2.5 sm:border-none sm:bg-transparent">
                                <div className="shrink-0 rounded-xl bg-amber-100 p-2 text-amber-800">
                                    <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>

                                <div className="text-left">
                                    <p className="text-xs font-bold text-stone-900 sm:text-sm">
                                        Holistic Care
                                    </p>

                                    <p className="text-[11px] text-stone-500 sm:text-xs">
                                        Natural Approach
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* =====================================================
              RIGHT SIDE - HERO IMAGE
          ===================================================== */}
                    <div className="relative mt-2 flex w-full max-w-full justify-center lg:col-span-5 lg:mt-0">

                        {/* Soft Glow Behind Image */}
                        <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-amber-200/20 blur-2xl" />

                        {/* Image Container */}
                        <div className="relative w-full max-w-md lg:max-w-none">

                            <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-white/80 p-2 shadow-xl shadow-emerald-900/10 backdrop-blur-sm sm:p-3">

                                {/* Doctor Couple Image */}
                                <div className="relative overflow-hidden rounded-2xl bg-emerald-50">

                                    <img
                                        src={heroImage}
                                        alt="Doctors at Malik's Polyclinic"
                                        className="block h-auto w-full object-cover object-center"
                                    />

                                    {/* Soft Bottom Gradient */}
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950/10 to-transparent" />

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