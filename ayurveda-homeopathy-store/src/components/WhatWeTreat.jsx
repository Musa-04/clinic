import React from 'react';
import {
    Utensils,
    Sparkles,
    Activity,
    Wind,
    Brain,
    HeartHandshake,
    Droplets,
    RefreshCw,
    Scale,
    Leaf,
    ChevronRight
} from 'lucide-react';

const conditions = [
    {
        id: 1,
        name: 'Digestive Disorders',
        description: 'Holistic remedies for acidity, IBS, bloating, constipation, and digestive health.',
        icon: Utensils,
        badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
        id: 2,
        name: 'Skin & Hair Disorders',
        description: 'Natural treatments for eczema, acne, hair fall, psoriasis, and skin allergies.',
        icon: Sparkles,
        badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
        id: 3,
        name: 'Joint & Muscle Disorders',
        description: 'Gentle relief for arthritis, backache, joint stiffness, and muscle inflammation.',
        icon: Activity,
        badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
        id: 4,
        name: 'Respiratory Disorders',
        description: 'Ayurvedic and Homeopathic care for asthma, bronchitis, sinus, and chronic cough.',
        icon: Wind,
        badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
        id: 5,
        name: 'Stress & Anxiety',
        description: 'Calming natural therapies for insomnia, nervous fatigue, stress, and mental focus.',
        icon: Brain,
        badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
        id: 6,
        name: "Women's Health",
        description: 'Specialized holistic support for hormonal balance, menstrual health, and well-being.',
        icon: HeartHandshake,
        badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
        id: 7,
        name: 'Urinary & Kidney Health',
        description: 'Natural herbal management for kidney stones, UTIs, and urinary tract health.',
        icon: Droplets,
        badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
        id: 8,
        name: 'PCOD / PCOS',
        description: 'Root-cause Ayurvedic treatment for irregular cycles and hormonal imbalance.',
        icon: RefreshCw,
        badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
        id: 9,
        name: 'Weight Management',
        description: 'Balanced herbal therapies for healthy metabolic regulation and weight loss.',
        icon: Scale,
        badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
        id: 10,
        name: 'General Wellness',
        description: 'Immunity enhancement, body rejuvenation, and preventive holistic health plans.',
        icon: Leaf,
        badgeColor: 'bg-emerald-100 text-emerald-800',
    },
];

const WhatWeTreat = () => {
    return (
        <section id="treatments" className="py-14 sm:py-20 bg-stone-50 border-t border-stone-200/80 w-full max-w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Specialized Care</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        What We Treat
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        At Malik's Polyclinic, we offer targeted Homeopathic and Ayurvedic therapies for a wide spectrum of chronic and acute health conditions.
                    </p>
                </div>

                {/* 10 Condition Cards Grid - Mobile First: 1 col on xs, 2 cols on sm, 3 cols on lg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                    {conditions.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                            >
                                {/* Subtle top border accent on hover */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div>
                                    {/* Icon & ID Header */}
                                    <div className="flex items-center justify-between mb-3.5">
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${item.badgeColor} flex items-center justify-center shadow-xs shrink-0`}>
                                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-semibold text-stone-400">
                                            Condition #{item.id < 10 ? `0${item.id}` : item.id}
                                        </span>
                                    </div>

                                    {/* Condition Name - No text overflow on long names */}
                                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-800 transition-colors mb-2 leading-snug break-words">
                                        {item.name}
                                    </h3>

                                    {/* Short 1-line Description */}
                                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                                    <span>Holistic Consultation</span>
                                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default WhatWeTreat;
