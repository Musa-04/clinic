import React from "react";
import TestimonialCard from "./TestimonialCard";
import testimonials from "../data/testimonials";

const Testimonials = () => {
  // Duplicate the list so the marquee can loop seamlessly as it scrolls.
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section className="w-full max-w-full overflow-hidden border-t border-stone-200/80 bg-stone-50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center sm:mb-12 sm:space-y-4">
          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            What Patients Say
          </h2>
          <p className="text-sm leading-relaxed text-stone-600 sm:text-base lg:text-lg">
            Real patient feedback about our consultations and care.
          </p>
        </div>

        <div className="marquee-mask relative">
          {/* Soft fade on the edges so cards slide in and out smoothly */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-stone-50 to-transparent sm:w-20"
            aria-hidden="true"
          ></div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-stone-50 to-transparent sm:w-20"
            aria-hidden="true"
          ></div>

          <div className="marquee-track">
            {marqueeItems.map((t, index) => (
              <div
                key={`${t.id}-${index}`}
                className="mr-4 w-[280px] shrink-0 sm:mr-6 sm:w-[340px]"
                aria-hidden={index >= testimonials.length ? "true" : undefined}
              >
                <TestimonialCard item={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
