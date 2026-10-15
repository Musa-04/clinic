import React from "react";
import {
  UserCheck,
  FlaskConical,
  HeartHandshake,
  PackageCheck,
  Users,
  Sparkles,
  Leaf,
} from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Qualified Doctors",
    description:
      "Our experienced doctors provide professional Homeopathic and Ayurvedic healthcare based on individual patient needs.",
    accent: "bg-emerald-900/50 text-emerald-300 border border-emerald-700/30",
  },
  {
    icon: FlaskConical,
    title: "Homeopathic & Ayurvedic Care",
    description:
      "Access both Homeopathic and Ayurvedic approaches under one trusted healthcare practice.",
    accent: "bg-teal-900/50 text-teal-300 border border-teal-700/30",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Treatment",
    description:
      "We focus on understanding individual health concerns and providing personalized treatment guidance.",
    accent: "bg-amber-900/40 text-amber-300 border border-amber-700/30",
  },
  {
    icon: PackageCheck,
    title: "Quality Medicines",
    description:
      "We are committed to providing carefully prepared and quality-focused medicines for our patients.",
    accent: "bg-sky-900/40 text-sky-300 border border-sky-700/30",
  },
  {
    icon: Users,
    title: "Patient-Centered Care",
    description:
      "Every patient is treated with attention, care, respect, and a focus on their individual needs.",
    accent: "bg-rose-900/40 text-rose-300 border border-rose-700/30",
  },
  {
    icon: Sparkles,
    title: "Focus on Overall Wellness",
    description:
      "Our approach focuses not only on individual concerns but also on supporting overall health and wellness.",
    accent: "bg-purple-900/40 text-purple-300 border border-purple-700/30",
  },
];

const WhyChooseUs = () => {
  return (
    <section
      id="why-us"
      className="w-full max-w-full border-t border-white/6 bg-black py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-14 sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3.5 py-1.5 text-xs font-bold tracking-wider text-emerald-300 uppercase">
            <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>Our Commitment</span>
          </div>

          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why Choose Malik's Polyclinic
          </h2>

          <p className="text-sm leading-relaxed text-stone-400 sm:text-base lg:text-lg">
            Trusted care that combines experience, personalized attention, and a
            holistic approach to your well-being.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col rounded-2xl border border-white/8 bg-neutral-900/80 p-5 shadow-xs transition-all duration-300 hover:border-emerald-600/30 hover:bg-neutral-900 sm:p-6"
              >
                <div
                  className={`h-11 w-11 rounded-xl ${item.accent} mb-4 flex shrink-0 items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mb-2 text-base leading-snug font-bold text-white transition-colors group-hover:text-emerald-300 sm:text-lg">
                  {item.title}
                </h3>

                <p className="grow text-xs leading-relaxed text-stone-400 sm:text-sm">
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
