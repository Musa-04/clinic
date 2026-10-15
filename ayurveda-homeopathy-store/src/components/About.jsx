import React from "react";
import {
  Leaf,
  Stethoscope,
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";

const highlights = [
  {
    icon: FlaskConical,
    title: "Homeopathic Care",
    description:
      "Personalized homeopathic care based on individual health needs.",
    color: "bg-emerald-900/50 text-emerald-300 border border-emerald-700/30",
  },
  {
    icon: Leaf,
    title: "Ayurvedic Care",
    description:
      "Traditional Ayurvedic approaches focused on natural and holistic wellness.",
    color: "bg-teal-900/50 text-teal-300 border border-teal-700/30",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Treatment",
    description:
      "Treatment plans designed around individual health concerns and requirements.",
    color: "bg-amber-900/40 text-amber-300 border border-amber-700/30",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="w-full max-w-full border-t border-white/6 bg-neutral-950 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Two-column layout */}
        <div className="mb-12 grid grid-cols-1 items-center gap-10 sm:mb-16 lg:grid-cols-2 lg:gap-16">
          {/* LEFT: Text content */}
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3.5 py-1.5 text-xs font-bold tracking-wider text-emerald-300 uppercase">
              <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>Who We Are</span>
            </div>

            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              About Malik's Polyclinic
            </h2>

            <p className="text-sm leading-relaxed text-stone-400 sm:text-base lg:text-lg">
              Malik's Polyclinic brings together Homeopathic and Ayurvedic
              approaches to provide personalized and holistic healthcare. Our
              goal is to understand each patient's individual needs and provide
              thoughtful treatment focused on better health and overall wellness.
            </p>

            {/* Key Trust Points */}
            <ul className="space-y-3 pt-2">
              {[
                "BHMS & BAMS certified physicians",
                "Root-cause, not symptom-only treatment",
                "Safe, natural, zero side-effect medicines",
                "Personalized consultation for every patient",
              ].map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-stone-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-950/40 transition-all duration-200 hover:bg-emerald-600 active:bg-emerald-800"
              >
                <Stethoscope className="h-4 w-4 shrink-0 text-emerald-200" />
                <span>Book a Consultation</span>
              </a>
            </div>
          </div>

          {/* RIGHT: Visual card */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm lg:max-w-none">
              <div className="pointer-events-none absolute inset-0 rotate-1 rounded-3xl bg-linear-to-tr from-emerald-600 to-teal-500 opacity-10 blur-lg" />
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-800 to-teal-900 p-7 text-white shadow-2xl sm:rounded-3xl sm:p-10">
                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

                <div className="relative z-10 space-y-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                        Our Doctors
                      </p>
                      <p className="text-lg font-bold text-white">
                        Dr. Mozim & Dr. Karishma
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "System", value: "Homeopathy", sub: "BHMS, CCH" },
                      { label: "System", value: "Ayurveda", sub: "BAMS, YIC" },
                      { label: "Approach", value: "Natural", sub: "Zero Side Effects" },
                      { label: "Care", value: "Holistic", sub: "Mind, Body & Soul" },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/10 p-3.5">
                        <p className="text-[10px] font-semibold tracking-wider text-emerald-200 uppercase">
                          {stat.label}
                        </p>
                        <p className="mt-0.5 text-base font-extrabold text-white">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-[11px] text-emerald-200/80">
                          {stat.sub}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
                    <span className="text-xs font-semibold text-emerald-100">
                      Certified Homeopathic & Ayurvedic Physicians
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Highlight Cards */}
        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3 sm:gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/8 bg-neutral-900/80 p-5 shadow-xs transition-all duration-300 hover:border-emerald-600/30 hover:bg-neutral-900 sm:p-6"
              >
                <div className={`h-11 w-11 rounded-xl ${item.color} mb-4 flex items-center justify-center shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-stone-400 sm:text-sm">
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

export default About;
