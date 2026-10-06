import React, { useState } from 'react';
import { ShoppingBag, Leaf, FlaskConical, LayoutGrid } from 'lucide-react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const FILTERS = ['All', 'Ayurvedic', 'Homeopathic'];

const Products = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered =
        activeFilter === 'All'
            ? products
            : products.filter((p) => p.category === activeFilter);

    return (
        <section
            id="medicines"
            className="py-14 sm:py-20 bg-stone-50 border-t border-stone-200/80 w-full max-w-full"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-850 text-xs font-bold uppercase tracking-wider">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Clinic Medicines</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                        Our Medicines
                    </h2>

                    <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                        Explore our range of Homeopathic and Ayurvedic medicines.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
                    {FILTERS.map((filter) => {
                        const Icon =
                            filter === 'Ayurvedic'
                                ? Leaf
                                : filter === 'Homeopathic'
                                    ? FlaskConical
                                    : LayoutGrid;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 min-h-[40px] cursor-pointer ${activeFilter === filter
                                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-800/20'
                                        : 'bg-white text-stone-600 border-stone-300 hover:border-emerald-400 hover:text-emerald-700'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                {filter}
                            </button>
                        );
                    })}
                </div>

                {/* Products Grid — 1 col mobile / 2 col tablet / 3 col desktop */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {filtered.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-stone-400 text-sm">
                        No medicines found for this category.
                    </div>
                )}

                {/* Bottom note */}
                <p className="text-center text-xs text-stone-400 mt-8 sm:mt-10">
                    All medicines are prescribed and recommended by our certified doctors.
                    Please <a href="#contact" className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800">consult a doctor</a> before use.
                </p>

            </div>
        </section>
    );
};

export default Products;
