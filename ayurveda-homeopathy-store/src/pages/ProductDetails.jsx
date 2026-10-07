import React from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Leaf,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";

const ProductDetails = ({ product, onBack, onAddToCart, onBuyNow }) => {
  const [quantity, setQuantity] = React.useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">
            Product not found
          </h2>

          <button
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isAyurvedic = product.category === "Ayurvedic";
  const totalPrice = Number(product.price) * quantity;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <button
            onClick={onBack}
            className="hover:text-emerald-700"
          >
            Home
          </button>

          <span>/</span>

          <button
            onClick={onBack}
            className="hover:text-emerald-700"
          >
            Products
          </button>

          <span>/</span>

          <span className="font-semibold text-stone-800">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product Section */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ================= IMAGE ================= */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-emerald-50 to-teal-50 p-4 sm:p-8">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400">
                    <Leaf className="mb-3 h-12 w-12" />
                    <span>Product Image</span>
                  </div>
                )}

                {/* Category Badge */}
                <div
                  className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm ${
                    isAyurvedic
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-indigo-200 bg-indigo-100 text-indigo-800"
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
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-emerald-600 bg-white p-1 shadow-sm">
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
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700">
              {product.category} Care
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5">
              <span className="text-3xl font-extrabold text-stone-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-stone-200" />

            {/* Product Description */}
            <p className="text-base leading-7 text-stone-600">
              {product.description}
            </p>

            {/* Features */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-stone-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <Truck className="h-4 w-4 text-emerald-700" />
                </div>
                <span>Delivery details will be confirmed with your order</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-stone-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <RotateCcw className="h-4 w-4 text-emerald-700" />
                </div>
                <span>Product return policy available</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-stone-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                </div>
                <span>Secure order process</span>
              </div>
            </div>

            {/* Quantity + Add To Cart */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
              {/* Quantity */}
              <div className="flex h-14 items-center justify-between rounded-xl border border-stone-300 bg-white px-4">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="text-base font-bold text-stone-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-stone-800 bg-white px-6 text-sm font-bold text-stone-900 transition hover:bg-stone-900 hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                ADD TO CART
              </button>
            </div>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 active:bg-emerald-900"
            >
              BUY NOW
            </button>

            {/* Total */}
            <div className="mt-4 rounded-xl bg-stone-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">
                  Total for {quantity} item{quantity > 1 ? "s" : ""}
                </span>

                <span className="text-base font-bold text-stone-900">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Trust Points */}
            <div className="mt-7 border-t border-stone-200 pt-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  Personalized healthcare
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  Doctor-guided care
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DESCRIPTION ================= */}
        <section className="mt-12 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:mt-16 sm:p-8">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
              Description
            </h2>
          </div>

          <div className="pt-5">
            <p className="max-w-4xl text-sm leading-7 text-stone-600 sm:text-base">
              {product.description}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetails;