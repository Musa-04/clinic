import React, { useEffect, useState } from "react";
import { ShoppingBag, Leaf, FlaskConical, LayoutGrid } from "lucide-react";
import ProductCard from "./ProductCard";

const Products = ({
  products,
  productCategories = [],
  catalogError,
  onViewProduct,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = [
    "All",
    ...new Set(
      (productCategories.length
        ? productCategories
        : products.map((product) => product.category)
      ).filter(Boolean),
    ),
  ];

  useEffect(() => {
    if (!filters.includes(activeFilter)) setActiveFilter("All");
  }, [activeFilter, filters.join("|")]);

  const filtered =
    activeFilter === "All"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section
      id="medicines"
      className="w-full max-w-full border-t border-stone-200/80 bg-stone-50 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center sm:mb-12 sm:space-y-4">
          <div className="text-emerald-850 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase">
            <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>Clinic Medicines</span>
          </div>

          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Our Medicines
          </h2>

          <p className="text-sm leading-relaxed text-stone-600 sm:text-base lg:text-lg">
            Explore our range of Homeopathic and Ayurvedic medicines.
          </p>
        </div>

        {/* Filter Tabs */}
        {catalogError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {catalogError}
          </p>
        )}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10 sm:gap-3">
          {filters.map((filter) => {
            const Icon =
              filter === "Ayurvedic"
                ? Leaf
                : filter === "Homeopathic"
                  ? FlaskConical
                  : LayoutGrid;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                  activeFilter === filter
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-800/20"
                    : "border-stone-300 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {filter}
              </button>
            );
          })}
        </div>

        {/* Products Grid — 2 col mobile / 3 col tablet & desktop */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={onViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-stone-400">
            No medicines found for this category.
          </div>
        )}

        {/* Bottom note */}
        <p className="mt-8 text-center text-xs text-stone-400 sm:mt-10">
          All medicines are prescribed and recommended by our certified doctors.
          Please{" "}
          <a
            href="#contact"
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            consult a doctor
          </a>{" "}
          before use.
        </p>
      </div>
    </section>
  );
};

export default Products;
