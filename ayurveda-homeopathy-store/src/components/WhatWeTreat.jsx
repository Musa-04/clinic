import React, { useState } from 'react';
import { ArrowRight, Clock3, Leaf, Sparkles } from 'lucide-react';
import { ayurvedicMassageServices, homeopathicTreatments } from '../data/services';

const WhatWeTreat = () => {
    const [activeCategory, setActiveCategory] = useState('Ayurvedic');

    const renderServiceCard = (service, isMassage = false) => (
        <article
            key={service.id}
            className={`group relative flex h-full min-h-40 flex-col overflow-hidden rounded-2xl border bg-neutral-900/80 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/35 hover:bg-neutral-900 ${
                service.featured
                    ? 'border-emerald-400/25 shadow-lg shadow-emerald-950/20'
                    : 'border-white/10'
            }`}
        >
            {service.featured && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Featured
                </span>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <h4 className={`mt-5 max-w-full pr-1 text-base font-semibold leading-snug text-white ${service.featured ? 'sm:pr-20' : ''}`}>
                {service.name}
            </h4>
            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                <p className="text-xl font-bold tracking-tight text-emerald-300">
                    ₹{service.price.toLocaleString('en-IN')}
                </p>
                {isMassage && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400">
                        <Clock3 className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                        {service.duration}
                    </p>
                )}
            </div>
        </article>
    );

    return (
        <section id="treatments" className="w-full max-w-full border-t border-white/[0.06] bg-neutral-950 py-14 text-stone-100 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center sm:mb-10 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                        <Leaf className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        Clinic Services
                    </div>
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Treatments &amp; Wellness Services
                    </h2>
                    <p className="text-sm leading-relaxed text-stone-400 sm:text-base lg:text-lg">
                        Explore our Ayurvedic wellness services and personalized treatment options.
                    </p>
                </div>

                <div className="mb-8 flex justify-center">
                    <div role="tablist" aria-label="Service category" className="inline-flex max-w-full rounded-2xl border border-white/10 bg-neutral-900 p-1">
                        {['Ayurvedic', 'Homeopathy'].map((category) => (
                            <button
                                key={category}
                                id={`services-tab-${category.toLowerCase()}`}
                                type="button"
                                role="tab"
                                aria-selected={activeCategory === category}
                                aria-controls="services-category-panel"
                                onClick={() => setActiveCategory(category)}
                                className={`min-h-11 rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:px-7 ${
                                    activeCategory === category
                                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/30'
                                        : 'text-stone-400 hover:text-white'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    id="services-category-panel"
                    role="tabpanel"
                    aria-labelledby={`services-tab-${activeCategory.toLowerCase()}`}
                >
                    {activeCategory === 'Ayurvedic' ? (
                        <div className="space-y-10 sm:space-y-12">
                            <section aria-labelledby="ayurvedic-massage-title">
                                <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Wellness services</p>
                                        <h3 id="ayurvedic-massage-title" className="mt-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">AYURVEDIC MASSAGE</h3>
                                    </div>
                                    <span className="hidden text-xs text-stone-500 sm:block">Price and session duration</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {ayurvedicMassageServices.map((service) => renderServiceCard(service, true))}
                                </div>
                            </section>

                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 sm:mb-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Personalized care</p>
                                <h3 className="mt-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">HOMEOPATHY TREATMENTS</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {homeopathicTreatments.map((service) => renderServiceCard(service))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-9 flex justify-center sm:mt-10">
                    <a href="#contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                        Book Appointment
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default WhatWeTreat;
