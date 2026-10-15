import React from "react";
import {
  Search,
  Stethoscope,
  ClipboardCheck,
  Package,
  Leaf,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Choose Your Concern",
    description:
      "Select the health concern or treatment area you would like help with.",
  },
  {
    number: "02",
    icon: Stethoscope,
    title: "Consult Our Doctor",
    description:
      "Connect with our qualified doctors to discuss your health concerns.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Get Treatment Recommendation",
    description:
      "Receive personalized treatment guidance based on your individual needs.",
  },
  {
    number: "04",
    icon: Package,
    title: "Get Your Medicines",
    description:
      "Get the recommended medicines and follow the treatment guidance provided.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="w-full max-w-full border-t border-stone-200/80 bg-stone-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center sm:mb-16 sm:space-y-4">
          <div className="text-emerald-850 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase">
            <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>Simple Process</span>
          </div>

          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            How It Works
          </h2>

          <p className="text-sm leading-relaxed text-stone-600 sm:text-base lg:text-lg">
            Getting started with Malik's Polyclinic is simple. Follow these four
            steps.
          </p>
        </div>

        {/* ────────────────────────────────────────────────────────────
            DESKTOP: 4 steps in a row connected by a horizontal line
            MOBILE:  4 steps stacked connected by a vertical line
        ──────────────────────────────────────────────────────────── */}

        {/* Desktop horizontal layout */}
        <div className="relative hidden items-start justify-between gap-0 md:flex">
          {/* Continuous connector line behind the step icons */}
          <div
            className="absolute top-[28px] right-[calc(12.5%)] left-[calc(12.5%)] z-0 h-0.5 bg-linear-to-r from-emerald-300 via-teal-300 to-emerald-300"
            aria-hidden="true"
          />

          {steps.map((step, _idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-1 flex-col items-center px-4 text-center"
              >
                {/* Step bubble */}
                <div className="mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg ring-4 shadow-emerald-800/25 ring-white">
                  <Icon className="h-6 w-6 text-emerald-100" />
                </div>

                {/* Step number */}
                <span className="mb-3 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                  Step {step.number}
                </span>

                {/* Title */}
                <h3 className="mb-2 text-base leading-snug font-extrabold text-stone-900">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="max-w-[180px] text-xs leading-relaxed text-stone-500 sm:text-sm">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical layout */}
        <div className="flex flex-col items-stretch gap-0 md:hidden">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;
            return (
              <div
                key={step.number}
                className="flex items-start gap-4 text-left"
              >
                {/* Left column: icon + vertical line */}
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-md ring-2 shadow-emerald-800/20 ring-white">
                    <Icon className="h-5 w-5 text-emerald-100" />
                  </div>
                  {!isLast && (
                    <div
                      className="my-1 min-h-9 w-0.5 grow bg-linear-to-b from-emerald-400 to-emerald-200"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Right column: text */}
                <div
                  className={`flex flex-col gap-1 ${isLast ? "pb-0" : "pb-6"}`}
                >
                  <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                    Step {step.number}
                  </span>
                  <h3 className="text-base leading-snug font-extrabold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center sm:mt-14">
          <a
            href="#contact"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-800 active:bg-emerald-900 sm:text-base"
          >
            <Stethoscope className="h-4 w-4 shrink-0 text-emerald-200" />
            <span>Start Your Consultation</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
