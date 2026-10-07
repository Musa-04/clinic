import React from 'react';
import { ImageOff, Eye, Leaf, FlaskConical, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * ProductCard
 * Props:
 *   product: { id, name, category, description, price, image }
 */
const ProductCard = ({ product }) => {
    const { name, category, description, price, image } = product;

    const isAyurvedic = category === 'Ayurvedic';

    const badge = isAyurvedic
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    const BadgeIcon = isAyurvedic ? Leaf : FlaskConical;

    const { addItem } = useCart() || {};

    return (
        <div className="group flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300/60 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">

            {/* ── Product Image Area ── */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 via-emerald-50 to-teal-50 border-b border-stone-200/80 flex flex-col items-center justify-center overflow-hidden">

                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    /* Placeholder until real product images are added */
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-stone-200/80 flex items-center justify-center mb-2">
                            <ImageOff className="w-7 h-7 text-stone-400" />
                        </div>
                        <p className="text-[11px] text-stone-400 font-medium">Product Image</p>
                    </>
                )}

                {/* Category Badge (top-left of image) */}
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge} shadow-xs`}>
                    <BadgeIcon className="w-3 h-3 shrink-0" />
                    {category}
                </span>
            </div>

            {/* ── Card Body ── */}
            <div className="flex flex-col flex-grow p-4 sm:p-5 text-left gap-2">

                {/* Medicine Name */}
                <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {name}
                </h3>

                {/* Short Description */}
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed flex-grow">
                    {description}
                </p>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-stone-100 gap-2">
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-800">
                        ₹{price.toLocaleString('en-IN')}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label={`Add ${name} to cart`}
                            onClick={() => addItem && addItem(product, 1)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-800/20 transition-all duration-200 min-h-[36px] cursor-pointer"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                            <span>Add</span>
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[36px] cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>View</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductCard;

