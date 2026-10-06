import React from 'react';
import {
    Leaf,
    Stethoscope,
    HeartHandshake,
    UserCheck,
    ShieldCheck,
    CheckCircle2,
    FlaskConical,
} from 'lucide-react';

const highlights = [
    {
        icon: FlaskConical,
        title: 'Homeopathic Care',
        description: 'Personalized homeopathic care based on individual health needs.',
        color: 'bg-emerald-100 text-emerald-800',
    },
    {
        icon: Leaf,
        title: 'Ayurvedic Care',
        description: 'Traditional Ayurvedic approaches focused on natural and holistic wellness.',
        color: 'bg-teal-100 text-teal-800',
    },
    {
        icon: HeartHandshake,
        title: 'Personalized Treatment',
        description: 'Treatment plans designed around individual health concerns and requirements.',
        color: 'bg-amber-100 text-amber-800',
    },
];

const About = () => {
    return (
        <section
            id="about"
            className="py-14 sm:py-20 bg-white border-t border-stone-200/80 w-full max-w-full"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Two-column layout: text left, visual right  */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12 sm:mb-16">

                    {/* ── LEFT: Text content ── */}
                    <div className="space-y-5 text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Who We Are</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                            About Malik's Polyclinic
                        </h2>

                        <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                            Malik's Polyclinic brings together Homeopathic and Ayurvedic approaches to provide
                            personalized and holistic healthcare. Our goal is to understand each patient's
                            individual needs and provide thoughtful treatment focused on better health and
                            overall wellness.
                        </p>

                        {/* Key Trust Points */}
                        <ul className="space-y-3 pt-2">
                            {[
                                'BHMS & BAMS certified physicians',
                                'Root-cause, not symptom-only treatment',
                                'Safe, natural, zero side-effect medicines',
                                'Personalized consultation for every patient',
                            ].map((point) => (
                                <li key={point} className="flex items-start gap-2.5 text-sm text-stone-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-2">
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm shadow-md shadow-emerald-800/20 transition-all duration-200 min-h-[44px]"
                            >
                                <Stethoscope className="w-4 h-4 text-emerald-200 shrink-0" />
                                <span>Book a Consultation</span>
                            </a>
                        </div>
                    </div>

                    {/* ── RIGHT: Visual placeholder / stats card ── */}
                    <div className="relative flex justify-center">
                        <div className="relative w-full max-w-sm lg:max-w-none">

                            {/* Soft glow behind the card */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-3xl rotate-1 opacity-15 blur-lg pointer-events-none" />

                            {/* Main visual card */}
                            <div className="relative bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-2xl overflow-hidden text-white">

                                {/* Decorative circle blobs */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

                                <div className="relative z-10 space-y-6 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                                            <UserCheck className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Our Doctors</p>
                                            <p className="text-lg font-bold text-white">Dr. Mozim & Dr. Karishma</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'System', value: 'Homeopathy', sub: 'BHMS, CCH' },
                                            { label: 'System', value: 'Ayurveda', sub: 'BAMS, YIC' },
                                            { label: 'Approach', value: 'Natural', sub: 'Zero Side Effects' },
                                            { label: 'Care', value: 'Holistic', sub: 'Mind, Body & Soul' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/10 rounded-xl p-3.5 border border-white/10">
                                                <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">{stat.label}</p>
                                                <p className="text-base font-extrabold text-white mt-0.5">{stat.value}</p>
                                                <p className="text-[11px] text-emerald-200/80 mt-0.5">{stat.sub}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                                        <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                                        <span className="text-xs text-emerald-100 font-semibold">
                                            Certified Homeopathic & Ayurvedic Physicians
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── 3 Highlight Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
                    {highlights.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-300"
                            >
                                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mb-4 shadow-xs`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default About;
