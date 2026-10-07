import React from 'react';
import TestimonialCard from './TestimonialCard';
import testimonials from '../data/testimonials';

const Testimonials = () => {
	return (
		<section className="py-14 sm:py-20 bg-stone-50 border-t border-stone-200/80 w-full max-w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
					<h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">What Patients Say</h2>
					<p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">Real patient feedback about our consultations and care.</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{testimonials.map((t) => (
						<TestimonialCard key={t.id} item={t} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
