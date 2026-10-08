import React from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  ShieldCheck,
  Leaf,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";

const ProductDetails = ({ product, onBack, onNavigate, onNavigateToProduct }) => {
  const [quantity, setQuantity] = React.useState(1);
  const [showAddedMessage, setShowAddedMessage] = React.useState(false);
  const { addItem, openCheckout } = useCart();
  const navigate = onNavigate || (() => {});

  if (!product) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-neutral-950 px-4 py-16 text-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Product Not Found
          </h1>
          <p className="mt-3 text-sm text-stone-400">
            This product may no longer be available.
          </p>
          <button
            type="button"
            onClick={onBack || (() => navigate("/#medicines"))}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const isAyurvedic = product.category === "Ayurvedic";
  const totalPrice = Number(product.price) * quantity;
  const availability = product.availability ?? product.status;
  const relatedProducts = products
    .filter((item) => String(item.id) !== String(product.id))
    .slice(0, 4);
  const extraInformation = [
    ["Benefits", product.benefits],
    ["How to Use", product.howToUse],
    ["Suitable For", product.suitableFor],
    ["Ingredients", product.ingredients],
    ["Product Details", product.productDetails ?? product.details],
  ].filter(([, value]) => value && (Array.isArray(value) ? value.length : true));

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setShowAddedMessage(true);
    window.setTimeout(() => setShowAddedMessage(false), 2200);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    openCheckout();
    onNavigate?.("/checkout");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-950 text-stone-100">
      {/* Top Navigation */}
      <div className="border-b border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-stone-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 pt-5 text-xs text-stone-500 sm:gap-2 sm:px-6 sm:pt-7 sm:text-sm lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="rounded-sm transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Home
          </button>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />

          <button
            onClick={() => navigate("/#medicines")}
            className="rounded-sm transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Products
          </button>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />

          <span className="min-w-0 wrap-break-word font-semibold text-stone-300">
            {product.name}
          </span>
      </nav>

      {/* Product Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ================= IMAGE ================= */}
          <div>
              <div className="group overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-sm">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-neutral-900 p-4 sm:p-8">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-500">
                    <Leaf className="mb-3 h-12 w-12 text-emerald-400" />
                    <span>Product Image</span>
                  </div>
                )}

                {/* Category Badge */}
                <div
                  className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm ${
                    isAyurvedic
                      ? "border-emerald-400/20 bg-neutral-950/90 text-emerald-200"
                      : "border-emerald-400/20 bg-neutral-950/90 text-emerald-200"
                  }`}
                >
                  {isAyurvedic ? (
                    <Leaf className="h-3.5 w-3.5" />
                  ) : (
                    <FlaskConical className="h-3.5 w-3.5" />
                  )}

                  {product.category}
                </div>
              </div>
            </div>

            {/* Small Product Thumbnail */}
            <div className="mt-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-emerald-400/40 bg-neutral-900 p-1 shadow-sm">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ================= PRODUCT INFO ================= */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400 sm:text-sm">
                {product.category}
              </div>
            )}

            {/* Product Name */}
            <h1 className="wrap-break-word text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5">
              <span className="text-3xl font-extrabold text-emerald-300 sm:text-4xl">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-white/10" />

            {/* Product Description */}
            <p className="text-sm leading-7 text-stone-300 sm:text-base">
              {product.description}
            </p>

            {availability && (
              <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {String(availability)}
              </p>
            )}

            {/* Features */}
            <div className="mt-6 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm text-stone-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
                  <ShoppingCart className="h-4 w-4 text-emerald-300" />
                </div>
                <span>Easy ordering</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-stone-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                </div>
                <span>Secure checkout</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-stone-300 sm:col-span-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
                  <Truck className="h-4 w-4 text-emerald-300" />
                </div>
                <span>Delivery details confirmed with your order</span>
              </div>
            </div>

            {/* Quantity + Add To Cart */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-stone-200">Quantity</p>
              {/* Quantity */}
              <div className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-neutral-900 p-1">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span aria-live="polite" className="min-w-12 px-2 text-center text-sm font-semibold text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add To Cart */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/70 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <ShoppingCart className="h-5 w-5" />
                ADD TO CART
              </button>
              <button
              type="button"
              onClick={handleBuyNow}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              BUY NOW
            </button>
            </div>

            <div className="mt-4 flex min-h-6 items-center" aria-live="polite">
              {showAddedMessage && (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Added to cart
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mt-2 rounded-xl border border-white/10 bg-white/3 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-400">
                  Total for {quantity} item{quantity > 1 ? "s" : ""}
                </span>

                <span className="text-base font-bold text-white">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

          </div>
        </div>

        <section className="mt-12 border-t border-white/10 pt-8 sm:mt-16 sm:pt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
              Product information
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Details
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {product.description && (
              <article className="min-w-0 rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white">Description</h3>
                <p className="mt-3 wrap-break-word text-sm leading-7 text-stone-400">
                  {product.description}
                </p>
              </article>
            )}
            {product.category && (
              <article className="min-w-0 rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white">Category</h3>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  {product.category}
                </p>
              </article>
            )}
            {extraInformation.map(([title, value]) => (
              <article key={title} className="min-w-0 rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-3 wrap-break-word text-sm leading-7 text-stone-400">
                  {Array.isArray(value) ? value.join(", ") : value}
                </p>
              </article>
            ))}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-white/10 pt-8 sm:mt-16 sm:pt-10">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
                Explore more
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Related Products
              </h2>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateToProduct?.(item)}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-left transition hover:border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="flex aspect-4/3 items-center justify-center overflow-hidden bg-black/30 p-3">
                    {item.image ? (
                      <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <Leaf className="h-8 w-8 text-emerald-400" aria-hidden="true" />
                    )}
                  </span>
                  <span className="block p-4">
                    <span className="block wrap-break-word text-sm font-semibold leading-5 text-white">
                      {item.name}
                    </span>
                    <span className="mt-2 block text-sm font-bold text-emerald-300">
                      ₹{(Number(item.price) || 0).toLocaleString("en-IN")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetails;