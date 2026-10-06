import React from 'react';
import {
    UserCheck,
    FlaskConical,
    HeartHandshake,
    PackageCheck,
    Users,
    Sparkles,
    Leaf,
} from 'lucide-react';

const features = [
    {
        icon: UserCheck,
        title: 'Qualified Doctors',
        description:
            'Our experienced doctors provide professional Homeopathic and Ayurvedic healthcare based on individual patient needs.',
        accent: 'bg-emerald-100 text-emerald-800',
    },
    {
        icon: FlaskConical,
        title: 'Homeopathic & Ayurvedic Care',
        description:
            'Access both Homeopathic and Ayurvedic approaches under one trusted healthcare practice.',
        accent: 'bg-teal-100 text-teal-800',
    },
    {
        icon: HeartHandshake,
        title: 'Personalized Treatment',
        description:
            'We focus on understanding individual health concerns and providing personalized treatment guidance.',
        accent: 'bg-amber-100 text-amber-800',
    },
    {
        icon: PackageCheck,
        title: 'Quality Medicines',
        description:
            'We are committed to providing carefully prepared and quality-focused medicines for our patients.',
        accent: 'bg-sky-100 text-sky-800',
    },
    {
        icon: Users,
        title: 'Patient-Centered Care',
        description:
            'Every patient is treated with attention, care, respect, and a focus on their individual needs.',
        accent: 'bg-rose-100 text-rose-800',
    },
    {
        icon: Sparkles,
        title: 'Focus on Overall Wellness',
        description:
            'Our approach focuses not only on individual concerns but also on supporting overall health and wellness.',
        accent: 'bg-purple-100 text-purple-800',
    },
];

const WhyChooseUs = () => {
    return (
        <section
            id="why-us"
            className="py-14 sm:py-20 bg-white border-t border-stone-200/80 w-full max-w-full"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Our Commitment</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        Why Choose Malik's Polyclinic
                    </h2>

                    <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        Trusted care that combines experience, personalized attention, and a holistic approach
                        to your well-being.
                    </p>
                </div>

                {/* 6 Feature Cards — 1-col mobile / 2-col tablet / 3-col desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                    {features.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="group flex flex-col bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                            >
                                {/* Icon */}
                                <div className={`w-11 h-11 rounded-xl ${item.accent} flex items-center justify-center mb-4 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors mb-2 leading-snug">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed flex-grow">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default WhyChooseUs;
