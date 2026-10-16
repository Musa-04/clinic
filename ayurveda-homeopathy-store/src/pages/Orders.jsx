import React, { useEffect, useState } from "react";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { formatOrderDate, getOrders } from "../utils/orderStorage";
import { normalizeOrderStatus } from "../services/adminOrderService";
import {
  isConfigured,
  getOrderByAccessToken,
} from "../utils/orderStorageSupabase";

const ORDERS_TOKEN_KEY = "maliks_last_order_access_token";

const Orders = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        if (isConfigured()) {
          // Secure guest order retrieval: only the order whose access token
          // was issued at checkout and stored in localStorage is visible.
          // Do not expose all orders via phone/email lookup.
          const token =
            typeof window !== "undefined"
              ? window.localStorage.getItem(ORDERS_TOKEN_KEY)
              : null;
          if (token) {
            const order = await getOrderByAccessToken(token);
            if (mounted) setOrders(order ? [order] : []);
          } else {
            if (mounted) setOrders([]);
          }
        } else {
          if (mounted) setOrders(getOrders());
        }
      } catch {
        if (mounted) {
          setError("Orders could not be loaded. Please try again.");
          setOrders(getOrders());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();

    const handleStorage = () => {
      if (!isConfigured()) {
        setOrders(getOrders());
      }
    };

    const handleOrdersUpdated = async () => {
      if (isConfigured()) {
        await loadOrders();
      } else {
        setOrders(getOrders());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("maliks-orders-updated", handleOrdersUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("maliks-orders-updated", handleOrdersUpdated);
    };
  }, []);

  return (
    <main className="min-h-[70vh] bg-neutral-950 px-4 py-10 text-stone-100 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.12em] text-emerald-400 uppercase">
          Malik's Polyclinic
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Your Orders
        </h1>

        {loading ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center sm:p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-stone-400">Loading orders...</p>
            </div>
          </section>
        ) : error ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center sm:p-12">
            <div className="flex flex-col items-center gap-3">
              <ShoppingBag className="mx-auto h-10 w-10 text-stone-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold text-white">
                Orders unavailable
              </h2>
              <p className="mt-2 text-sm text-stone-400">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
              >
                Retry
              </button>
            </div>
          </section>
        ) : orders.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center sm:p-12">
            <ShoppingBag
              className="mx-auto h-10 w-10 text-emerald-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold text-white">
              No orders yet
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Start shopping to see your orders here.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("/#medicines")}
              className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
            >
              Browse Products
            </button>
          </section>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (count, item) => count + Number(item.quantity || 0),
                0,
              );
              const status = normalizeOrderStatus(order);
              const cancelled = status === "CANCELLED";
              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                        <Package className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold break-all text-white sm:text-base">
                          {order.id}
                        </h2>
                        <p className="mt-1 text-xs text-stone-400">
                          {formatOrderDate(order.createdAt, {
                            dateStyle: "medium",
                          })}{" "}
                          · {itemCount} item{itemCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${cancelled ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                      <span className="text-base font-bold text-white">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/orders/${encodeURIComponent(order.id)}`)
                        }
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
                      >
                        View Order{" "}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4 text-xs text-stone-400">
                    Payment: {order.payment?.status || "Status unavailable"}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
