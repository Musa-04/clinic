import React from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { formatOrderDate, getOrderById } from "../utils/orderStorage";

const OrderSuccess = ({ orderId, onNavigate }) => {
  const order = getOrderById(orderId);

  return (
    <main className="min-h-[70vh] bg-neutral-950 px-4 py-12 text-stone-100 sm:py-20">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-neutral-900 p-6 text-center sm:p-10">
        {order ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
              Order Placed Successfully
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              Your order has been saved. Payment was submitted and is pending verification.
            </p>
            <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-left sm:grid-cols-3">
              <div>
                <p className="text-xs text-stone-500">Order ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Order Date</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatOrderDate(order.createdAt, { dateStyle: "medium" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Total</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
              Payment submitted — verification pending
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate(`/orders/${encodeURIComponent(order.id)}`)}
                className="min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                View Order Details
              </button>
              <button
                type="button"
                onClick={() => onNavigate("/#medicines")}
                className="min-h-12 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => onNavigate("/orders")}
                className="min-h-12 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Order History
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white">Order Not Found</h1>
            <p className="mt-3 text-sm text-stone-400">This order is not available in this browser.</p>
            <button
              type="button"
              onClick={() => onNavigate("/orders")}
              className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              View Orders
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default OrderSuccess;