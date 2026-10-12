import React from "react";
import { Star } from "lucide-react";

const TestimonialCard = ({ item }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
          {item.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-900">{item.name}</p>
              <p className="text-xs text-stone-500">{item.location}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4" />
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
