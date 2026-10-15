import React from "react";
import { X, Trash } from "lucide-react";
import { useCart } from "../context/CartContext";
import { pushNotification } from "../utils/notificationStore";

const CartDrawer = ({ onCheckout, onBrowse }) => {
  const {
    items,
    isOpen,
    close,
    increase,
    decrease,
    removeItem,
    subtotal,
    clear,
    openCheckout,
  } = useCart();

  if (!isOpen) return null;

  const notify = (title, message, type = "success") =>
    pushNotification({ audience: "user", type, title, message });

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="flex-1" onClick={close} />

      <aside className="w-full max-w-md overflow-y-auto bg-white p-4 shadow-2xl sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Your Cart</h3>
          <button
            aria-label="Close cart"
            onClick={close}
            className="cursor-pointer rounded-md p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-stone-600">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => {
                close();
                onBrowse?.();
              }}
              className="mt-4 inline-flex items-center rounded-xl bg-emerald-700 px-4 py-2 text-white"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <img
                  src={it.image || "/vite.svg"}
                  alt={it.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{it.name}</h4>
                    <button
                      aria-label="Remove item"
                      onClick={() => {
                        removeItem(it.id);
                        notify("Item removed", `${it.name} was removed from your cart.`);
                      }}
                      className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md p-1 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      <Trash className="h-4 w-4 text-rose-600" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    ₹{Number(it.price).toLocaleString("en-IN")}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => decrease(it.id)}
                      className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      -
                    </button>
                    <span className="flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 py-1" aria-live="polite">
                      {it.quantity}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => increase(it.id)}
                      className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">
                  ₹{Number(subtotal).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    clear();
                    notify("Cart cleared", "All items have been removed from your cart.");
                  }}
                  className="min-h-12 flex-1 cursor-pointer rounded-xl border px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => {
                    close();
                    if (onCheckout) onCheckout();
                    else openCheckout();
                  }}
                  className="min-h-12 flex-1 cursor-pointer rounded-xl bg-emerald-700 px-4 py-3 text-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Proceed to Order
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
