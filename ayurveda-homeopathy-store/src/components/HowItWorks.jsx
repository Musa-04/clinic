import React from 'react';
import { Search, Stethoscope, ClipboardCheck, Package, Leaf } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: Search,
        title: 'Choose Your Concern',
        description: 'Select the health concern or treatment area you would like help with.',
    },
    {
        number: '02',
        icon: Stethoscope,
        title: 'Consult Our Doctor',
        description: 'Connect with our qualified doctors to discuss your health concerns.',
    },
    {
        number: '03',
        icon: ClipboardCheck,
        title: 'Get Treatment Recommendation',
        description: 'Receive personalized treatment guidance based on your individual needs.',
    },
    {
        number: '04',
        icon: Package,
        title: 'Get Your Medicines',
        description: 'Get the recommended medicines and follow the treatment guidance provided.',
    },
];

const HowItWorks = () => {
    return (
        <section
            id="how-it-works"
            className="py-14 sm:py-20 bg-stone-50 border-t border-stone-200/80 w-full max-w-full"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Simple Process</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        How It Works
                    </h2>

                    <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        Getting started with Malik's Polyclinic is simple. Follow these four steps.
                    </p>
                </div>

                {/* ────────────────────────────────────────────────────────────
            DESKTOP: 4 steps in a row connected by a horizontal line
            MOBILE:  4 steps stacked connected by a vertical line
        ──────────────────────────────────────────────────────────── */}

                {/* Desktop horizontal layout */}
                <div className="hidden md:flex items-start justify-between gap-0 relative">

                    {/* Continuous connector line behind the step icons */}
                    <div
                        className="absolute top-[28px] left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 z-0"
                        aria-hidden="true"
                    />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="relative z-10 flex flex-col items-center text-center flex-1 px-4"
                            >
                                {/* Step bubble */}
                                <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-800/25 ring-4 ring-white mb-5 shrink-0">
                                    <Icon className="w-6 h-6 text-emerald-100" />
                                </div>

                                {/* Step number */}
                                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-3">
                                    Step {step.number}
                                </span>

                                {/* Title */}
                                <h3 className="text-base font-extrabold text-stone-900 mb-2 leading-snug">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-[180px]">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile vertical layout */}
                <div className="md:hidden flex flex-col items-stretch gap-0">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isLast = idx === steps.length - 1;
                        return (
                            <div key={step.number} className="flex items-start gap-4 text-left">

                                {/* Left column: icon + vertical line */}
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-800/20 ring-2 ring-white shrink-0">
                                        <Icon className="w-5 h-5 text-emerald-100" />
                                    </div>
                                    {!isLast && (
                                        <div className="w-0.5 flex-grow bg-gradient-to-b from-emerald-400 to-emerald-200 my-1 min-h-[36px]" aria-hidden="true" />
                                    )}
                                </div>

                                {/* Right column: text */}
                                <div className={`flex flex-col gap-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit">
                                        Step {step.number}
                                    </span>
                                    <h3 className="text-base font-extrabold text-stone-900 leading-snug">
                                        {step.title}
                                    </h3>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* CTA Button */}
                <div className="mt-12 sm:mt-14 text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-800/25 transition-all duration-200 min-h-[48px]"
                    >
                        <Stethoscope className="w-4 h-4 text-emerald-200 shrink-0" />
                        <span>Start Your Consultation</span>
                    </a>
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;
