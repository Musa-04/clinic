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
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    icon: Leaf,
    title: "Ayurvedic Care",
    description:
      "Traditional Ayurvedic approaches focused on natural and holistic wellness.",
    color: "bg-teal-100 text-teal-800",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Treatment",
    description:
      "Treatment plans designed around individual health concerns and requirements.",
    color: "bg-amber-100 text-amber-800",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="w-full max-w-full border-t border-stone-200/80 bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Two-column layout: text left, visual right  */}
        <div className="mb-12 grid grid-cols-1 items-center gap-10 sm:mb-16 lg:grid-cols-2 lg:gap-16">
          {/* ── LEFT: Text content ── */}
          <div className="space-y-5 text-left">
            <div className="text-emerald-850 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase">
              <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>Who We Are</span>
            </div>

            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              About Malik's Polyclinic
            </h2>

            <p className="text-sm leading-relaxed text-stone-600 sm:text-base lg:text-lg">
              Malik's Polyclinic brings together Homeopathic and Ayurvedic
              approaches to provide personalized and holistic healthcare. Our
              goal is to understand each patient's individual needs and provide
              thoughtful treatment focused on better health and overall
              wellness.
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
                  className="flex items-start gap-2.5 text-sm text-stone-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-800 active:bg-emerald-900"
              >
                <Stethoscope className="h-4 w-4 shrink-0 text-emerald-200" />
                <span>Book a Consultation</span>
              </a>
            </div>
          </div>

          {/* ── RIGHT: Visual placeholder / stats card ── */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm lg:max-w-none">
              {/* Soft glow behind the card */}
              <div className="pointer-events-none absolute inset-0 rotate-1 rounded-3xl bg-linear-to-tr from-emerald-400 to-teal-300 opacity-15 blur-lg" />

              {/* Main visual card */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-700 to-teal-800 p-7 text-white shadow-2xl sm:rounded-3xl sm:p-10">
                {/* Decorative circle blobs */}
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
                      {
                        label: "System",
                        value: "Homeopathy",
                        sub: "BHMS, CCH",
                      },
                      { label: "System", value: "Ayurveda", sub: "BAMS, YIC" },
                      {
                        label: "Approach",
                        value: "Natural",
                        sub: "Zero Side Effects",
                      },
                      {
                        label: "Care",
                        value: "Holistic",
                        sub: "Mind, Body & Soul",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-white/10 p-3.5"
                      >
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

        {/* ── 3 Highlight Cards ── */}
        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3 sm:gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200/80 bg-stone-50 p-5 shadow-xs transition-all duration-300 hover:border-emerald-200 hover:shadow-md sm:p-6"
              >
                <div
                  className={`h-11 w-11 rounded-xl ${item.color} mb-4 flex items-center justify-center shadow-xs`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-stone-900 sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-stone-600 sm:text-sm">
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
