import React from "react";
import {
    Stethoscope,
    Calendar,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

import doctorMozim from "../assets/Doctor-mozim.png";
import doctorKarishma from "../assets/doctor-karishma.png";

const doctorsData = [
    {
        name: "Dr. Mozim Malik",
        qualification: "BHMS, CCH",
        title: "Homeopathic Physician",
        system: "Homeopathy Specialist",
        image: doctorMozim,
        description:
            "Experienced in treating chronic conditions, digestive disorders, skin ailments, and allergic diseases using Homeopathic healthcare approaches.",
        highlights: [
            "Constitutional Healing",
            "Chronic Care",
            "Personalized Treatment",
        ],
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
        name: "Dr. Karishma Malik",
        qualification: "BAMS, YIC",
        title: "Ayurvedic Physician",
        system: "Ayurveda Specialist",
        image: doctorKarishma,
        description:
            "Provides Ayurvedic healthcare with a focus on women's health, PCOD/PCOS, joint care, metabolic wellness, and lifestyle guidance.",
        highlights: [
            "Ayurvedic Therapeutics",
            "Women's Health & PCOD",
            "Nadi & Dosha Assessment",
        ],
        badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    },
];

const Doctors = () => {
    return (
        <section
            id="doctors"
            className="w-full border-t border-stone-200/80 bg-white py-14 sm:py-20"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* =========================
            SECTION HEADER
        ========================== */}
                <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                        <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Expert Medical Team</span>
                    </div>

                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                        Meet Our Doctors
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:mt-4 sm:text-base lg:text-lg">
                        Our dedicated physicians provide Homeopathic and Ayurvedic
                        healthcare with a personalized approach to your individual needs.
                    </p>
                </div>

                {/* =========================
            DOCTOR CARDS
        ========================== */}
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">

                    {doctorsData.map((doc) => (
                        <article
                            key={doc.name}
                            className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl"
                        >

                            {/* =========================
                  DOCTOR IMAGE
              ========================== */}
                            <div className="p-3 pb-0 sm:p-4 sm:pb-0">

                                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-stone-100 to-teal-50 sm:rounded-2xl">

                                    <img
                                        src={doc.image}
                                        alt={`${doc.name} - ${doc.title}`}
                                        className="h-full w-full object-contain object-center transition-transform duration-500 hover:scale-[1.02]"
                                    />

                                </div>

                            </div>

                            {/* =========================
                  CARD CONTENT
              ========================== */}
                            <div className="flex flex-1 flex-col p-5 sm:p-7">

                                {/* System + Qualified */}
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${doc.badgeBg}`}
                                    >
                                        {doc.system}
                                    </span>

                                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span>Qualified Doctor</span>
                                    </div>

                                </div>

                                {/* Doctor Name */}
                                <h3 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl lg:text-3xl">
                                    {doc.name}
                                </h3>

                                {/* Qualification */}
                                <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">

                                    <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-800">
                                        {doc.qualification}
                                    </span>

                                    <span className="text-xs font-semibold text-stone-600 sm:text-sm">
                                        • {doc.title}
                                    </span>

                                </div>

                                {/* Description */}
                                <p className="mb-5 text-sm leading-7 text-stone-600">
                                    {doc.description}
                                </p>

                                {/* Highlights */}
                                <div className="mb-6 space-y-2 border-t border-stone-200 pt-4">

                                    {doc.highlights.map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-2 text-sm font-medium text-stone-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                            <span>{item}</span>
                                        </div>
                                    ))}

                                </div>

                                {/* Contact Button */}
                                <div className="mt-auto border-t border-stone-200 pt-4">

                                    <a
                                        href="#contact"
                                        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-800 active:bg-emerald-900"
                                    >
                                        <Calendar className="h-4 w-4 text-emerald-200" />

                                        <span>
                                            Contact {doc.name.replace("Dr. ", "")}
                                        </span>
                                    </a>

                                </div>

                            </div>
                        </article>
                    ))}

                </div>
            </div>
        </section>
    );
};

export default Doctors;