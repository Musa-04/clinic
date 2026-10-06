import React from 'react';
import { UserCheck, Stethoscope, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

const doctorsData = [
    {
        name: 'Dr. Mozim Malik',
        qualification: 'BHMS, CCH',
        title: 'Homeopathic Physician',
        system: 'Homeopathy Specialist',
        description: 'Experienced in treating chronic conditions, digestive disorders, skin ailments, and allergic diseases using gentle, constitutional Homeopathic remedies.',
        highlights: ['Constitutional Healing', 'Chronic Care Expert', 'Safe & Gentle Remedies'],
        badgeBg: 'bg-emerald-100 text-emerald-850 border-emerald-200',
        avatarGradient: 'from-emerald-700 via-teal-800 to-stone-800',
        avatarIconColor: 'text-emerald-100',
    },
    {
        name: 'Dr. Karishma Malik',
        qualification: 'BAMS, YIC',
        title: 'Ayurvedic Physician',
        system: 'Ayurveda Specialist',
        description: 'Specializes in Ayurvedic Nadi Pariksha, herbal therapy, PCOD/PCOS management, metabolic health, joint care, and lifestyle wellness consultations.',
        highlights: ['Ayurvedic Therapeutics', 'Women\'s Health & PCOD', 'Nadi & Dosha Assessment'],
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
        avatarGradient: 'from-teal-700 via-emerald-800 to-stone-800',
        avatarIconColor: 'text-amber-100',
    },
];

const Doctors = () => {
    return (
        <section id="doctors" className="py-14 sm:py-20 bg-white border-t border-stone-200/80 w-full max-w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Heading */}
                <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Expert Medical Team</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        Meet Our Doctors
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        Our dedicated physicians bring together years of clinical expertise in Homeopathy and Ayurveda to deliver personalized health plans.
                    </p>
                </div>

                {/* Doctor Cards Grid - Stacked on Mobile, 2-Col on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto text-left">
                    {doctorsData.map((doc, index) => (
                        <div
                            key={index}
                            className="bg-stone-50/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>

                                {/* Photo Placeholder Area - Mobile Responsive */}
                                <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-stone-200 via-emerald-100/40 to-stone-100 border border-stone-300/60 flex flex-col items-center justify-center p-4 sm:p-6 text-center shadow-inner mb-5">

                                    {/* Clean Doctor Avatar Placeholder */}
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${doc.avatarGradient} flex items-center justify-center text-white shadow-md mb-2 sm:mb-3 ring-4 ring-white shrink-0`}>
                                        <UserCheck className={`w-8 h-8 sm:w-10 sm:h-10 ${doc.avatarIconColor}`} />
                                    </div>

                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/90 text-stone-700 border border-stone-200 shadow-2xs">
                                        Doctor Photo Placeholder
                                    </span>
                                </div>

                                {/* System Badge & Verified Indicator */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${doc.badgeBg}`}>
                                        {doc.system}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Verified Physician</span>
                                    </div>
                                </div>

                                {/* Doctor Name & Qualifications */}
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
                                    {doc.name}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
                                    <span className="text-sm sm:text-base font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                                        {doc.qualification}
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-stone-600">
                                        • {doc.title}
                                    </span>
                                </div>

                                {/* Bio Description */}
                                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-5">
                                    {doc.description}
                                </p>

                                {/* Clinical Highlights */}
                                <div className="space-y-2 mb-6 pt-4 border-t border-stone-200/70">
                                    {doc.highlights.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            {/* Consultation Action Button */}
                            <div className="pt-4 border-t border-stone-200/80">
                                <a
                                    href="#contact"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 active:bg-emerald-800 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 transition-all duration-200 min-h-[48px]"
                                >
                                    <Calendar className="w-4 h-4 text-emerald-200 shrink-0" />
                                    <span>Contact {doc.name.split(' ')[1]}</span>
                                </a>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Doctors;
