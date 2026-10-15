import React from "react";
import { ImageOff, Eye, Leaf, FlaskConical, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { pushNotification } from "../utils/notificationStore";

/**
 * ProductCard
 * Props:
 *   product: { id, name, category, description, price, image }
 */
const ProductCard = ({ product, onView }) => {
  const { name, category, description, price, image } = product;

  const isAyurvedic = category === "Ayurvedic";

  const badge = isAyurvedic
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-indigo-100 text-indigo-800 border-indigo-200";

  const BadgeIcon = isAyurvedic ? Leaf : FlaskConical;

  const { addItem } = useCart() || {};

  const handleAddToCart = () => {
    if (!addItem) {
      pushNotification({ audience: "user", type: "warning", title: "Cart unavailable", message: "Please refresh the page and try adding this medicine again." });
      return;
    }
    addItem(product, 1);
    pushNotification({ audience: "user", type: "success", title: "Added to cart", message: `${name} has been added to your cart.` });
  };

  return (
    <div className="group flex h-full min-w-0 transform flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-xl">
      {/* ── Product Image Area ── */}
      <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden border-b border-stone-200/80 bg-linear-to-br from-stone-100 via-emerald-50 to-teal-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full transform object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Placeholder until real product images are added */
          <>
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200/80">
              <ImageOff className="h-7 w-7 text-stone-400" />
            </div>
            <p className="text-[11px] font-medium text-stone-400">
              Product Image
            </p>
          </>
        )}

        {/* Category Badge (top-left of image) */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badge} shadow-xs`}
        >
          <BadgeIcon className="h-3 w-3 shrink-0" />
          {category}
        </span>
      </div>

      {/* ── Card Body ── */}
      <div className="flex grow flex-col gap-2 p-4 text-left sm:p-5">
        {/* Medicine Name */}
        <h3 className="text-base leading-snug font-bold wrap-break-word text-stone-900 transition-colors group-hover:text-emerald-800 sm:text-lg">
          {name}
        </h3>

        {/* Short Description */}
        <p className="hidden grow text-xs leading-relaxed wrap-break-word text-stone-500 sm:block sm:text-sm">
          {description}
        </p>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-stone-100 pt-2.5">
          <span className="text-lg font-extrabold text-emerald-800 sm:text-xl">
            ₹{price.toLocaleString("en-IN")}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label={`Add ${name} to cart`}
              onClick={handleAddToCart}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-800 active:bg-emerald-900 sm:text-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
              <span>Add</span>
            </button>

            <button
              type="button"
              onClick={() => onView?.(product)}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-all duration-200 sm:text-sm"
            >
              <Eye className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
