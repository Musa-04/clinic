import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard = ({ item }) => {
	return (
		<div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
					{item.name.charAt(0)}
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-bold text-stone-900">{item.name}</p>
							<p className="text-xs text-stone-500">{item.location}</p>
						</div>
						<div className="flex items-center gap-1 text-amber-500">
							<Star className="w-4 h-4" />
							<span className="text-sm font-semibold">{item.rating}</span>
						</div>
					</div>
					<p className="mt-3 text-sm text-stone-600">{item.review}</p>
				</div>
			</div>
		</div>
	);
};

export default TestimonialCard;
