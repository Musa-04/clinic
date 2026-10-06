import React from 'react';
import { ArrowRight, Stethoscope, Sparkles, ShieldCheck, HeartHandshake, Leaf, ImageOff } from 'lucide-react';

const Hero = () => {
    return (
        <section id="home" className="relative overflow-hidden pt-6 sm:pt-12 pb-16 sm:pb-24 bg-gradient-to-b from-emerald-50/60 via-stone-50 to-white w-full max-w-full">

            {/* Decorative Soft Background Glows */}
            <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-200/25 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 bg-amber-100/30 rounded-full blur-2xl -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left Column: Text & Action Buttons */}
                    <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-6 text-left max-w-full">

                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-850 text-xs sm:text-sm font-semibold tracking-wide shadow-xs max-w-full">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 fill-emerald-600/30" />
                            <span className="truncate">Ayurvedic & Homeopathic Polyclinic</span>
                        </div>

                        {/* Main Heading - Mobile First Resizing */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.18] sm:leading-[1.15] break-words">
                            Malik's{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800">
                                Polyclinic
                            </span>
                        </h1>

                        {/* Professional Subheading */}
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 tracking-tight leading-snug">
                            Natural Care. Better Health. Personalized Treatment.
                        </p>

                        {/* Short Description */}
                        <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
                            We provide Homeopathic and Ayurvedic healthcare with a focus on natural, personalized and holistic treatment.
                        </p>

                        {/* Action Buttons - Touch Friendly & Full Width on Mobile */}
                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <a
                                href="#treatments"
                                className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-emerald-700 active:bg-emerald-800 hover:bg-emerald-800 text-white font-semibold text-base shadow-md shadow-emerald-800/25 transition-all duration-200 min-h-[48px] text-center"
                            >
                                <span>Explore Medicines</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            </a>

                            <a
                                href="#doctors"
                                className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-emerald-50/60 text-emerald-900 font-semibold text-base border-2 border-emerald-700/25 hover:border-emerald-700/50 shadow-xs transition-all duration-200 min-h-[48px] text-center"
                            >
                                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
                                <span>Contact Doctor</span>
                            </a>
                        </div>

                        {/* Trust Highlights - Mobile Stack / Grid */}
                        <div className="pt-6 border-t border-stone-200/80 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 sm:bg-transparent border border-stone-200/50 sm:border-none">
                                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs sm:text-sm font-bold text-stone-900">100% Pure</p>
                                    <p className="text-[11px] sm:text-xs text-stone-500">Natural Treatments</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 sm:bg-transparent border border-stone-200/50 sm:border-none">
                                <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs sm:text-sm font-bold text-stone-900">Expert Doctors</p>
                                    <p className="text-[11px] sm:text-xs text-stone-500">BHMS & BAMS</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 sm:bg-transparent border border-stone-200/50 sm:border-none">
                                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs sm:text-sm font-bold text-stone-900">Zero Side Effects</p>
                                    <p className="text-[11px] sm:text-xs text-stone-500">Gentle Healing</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Mobile-friendly Responsive Image Container */}
                    <div className="lg:col-span-5 relative flex justify-center w-full max-w-full mt-4 lg:mt-0">
                        <div className="relative w-full max-w-md lg:max-w-none">

                            {/* Decorative Frame Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-3xl rotate-1 opacity-20 blur-md pointer-events-none" />

                            {/* Main Container Card */}
                            <div className="relative rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 shadow-xl border border-stone-200/80 overflow-hidden">
                                {/* ── HERO IMAGE PLACEHOLDER ──────────────────────────────
                                     Upload your real clinic photo to /public/ folder,
                                     then replace this block with:
                                     <img src="/your-photo.jpg" alt="..." className="w-full h-full object-cover" />
                                ────────────────────────────────────────────────────── */}
                                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[14/11] bg-gradient-to-br from-emerald-50 via-stone-100 to-teal-50 border-2 border-dashed border-emerald-300/70 flex flex-col items-center justify-center gap-3 text-center p-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                        <ImageOff className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-600">Clinic Photo</p>
                                        <p className="text-xs text-stone-400 mt-1">Your image will appear here</p>
                                    </div>
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
