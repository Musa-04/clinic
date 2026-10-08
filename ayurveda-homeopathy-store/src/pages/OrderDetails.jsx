import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  MapPin,
  PackageCheck,
  Printer,
  Truck,
  X,
} from "lucide-react";
import {
  formatOrderDate,
  getOrderById,
  updateOrder,
} from "../utils/orderStorage";

const CANCEL_REASONS = [
  "I ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Wrong item or quantity",
  "No longer need the items",
  "Other",
];

const OrderDetails = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState(() => getOrderById(orderId));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelledConfirmation, setCancelledConfirmation] = useState(false);

  useEffect(() => {
    const refreshOrder = () => setOrder(getOrderById(orderId));
    refreshOrder();
    window.addEventListener("storage", refreshOrder);
    window.addEventListener("maliks-orders-updated", refreshOrder);
    return () => {
      window.removeEventListener("storage", refreshOrder);
      window.removeEventListener("maliks-orders-updated", refreshOrder);
    };
  }, [orderId]);

  useEffect(() => {
    if (!cancelOpen && !cancelledConfirmation) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !cancelledConfirmation) {
        setCancelOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelOpen, cancelledConfirmation]);

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-neutral-950 px-4 py-16 text-center text-stone-100">
        <div>
          <h1 className="text-2xl font-bold text-white">Order Not Found</h1>
          <p className="mt-3 text-sm text-stone-400">This order is not available in this browser.</p>
          <button type="button" onClick={() => onNavigate("/orders")} className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">View Orders</button>
        </div>
      </main>
    );
  }

  const normalizedStatus = String(order.orderStatus || "PLACED").toUpperCase();
  const cancelled = normalizedStatus === "CANCELLED" || order.cancellation?.cancelled;
  const canCancel = ["PLACED", "PENDING", "CONFIRMED"].includes(normalizedStatus) && !cancelled;
  const itemCount = (order.items || []).reduce((count, item) => count + Number(item.quantity || 0), 0);
  const statusSteps = cancelled
    ? [
        { label: "Placed", description: "Your order was placed.", done: true, Icon: CheckCircle2 },
        { label: "Cancelled", description: order.cancellation?.reason || "This order was cancelled.", done: true, Icon: X },
      ]
    : [
        { label: "Placed", description: "Your order has been placed successfully.", Icon: CheckCircle2 },
        { label: "Confirmed", description: "Your order has been confirmed and processing has started.", Icon: ClipboardList },
        { label: "Shipped", description: "Your order is on its way to you.", Icon: Truck },
        { label: "Delivered", description: "Your order has been delivered.", Icon: PackageCheck },
      ];
  const activeStep = {
    PLACED: 0,
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  }[normalizedStatus] ?? 0;

  const handleCancelOrder = () => {
    const reason = cancelReason === "Other" ? otherReason.trim() : cancelReason;
    if (!reason) {
      setCancelError("Select a reason to continue.");
      return;
    }

    const updatedOrder = updateOrder(order.id, {
      orderStatus: "Cancelled",
      cancellation: {
        cancelled: true,
        reason,
        cancelledAt: new Date().toISOString(),
      },
    });
    if (updatedOrder) {
      setOrder(updatedOrder);
      setCancelledConfirmation(true);
      setCancelError("");
    }
  };

  const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-stone-100 sm:px-6 sm:py-10 lg:px-8 print:bg-white print:text-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button type="button" onClick={() => onNavigate("/#medicines")} className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-stone-300 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Shopping
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              <Printer className="h-4 w-4" aria-hidden="true" /> Download Invoice
            </button>
            <button type="button" onClick={() => onNavigate("/#medicines")} className="min-h-10 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500">Continue Shopping</button>
          </div>
        </div>

        <header className="mb-7 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">Order Details</p>
          <h1 className="mt-2 break-all text-2xl font-bold text-white sm:text-3xl">{order.id}</h1>
          <p className="mt-2 text-sm text-stone-400">Placed {formatOrderDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="min-w-0 space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Order Status</p>
                <span className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${cancelled ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
                  {cancelled ? "Cancelled" : normalizedStatus === "PENDING" ? "Pending" : normalizedStatus.charAt(0) + normalizedStatus.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Payment Status</p>
                <span className="mt-3 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-200">
                  {order.payment?.status || "Pending Verification"}
                </span>
                <p className="mt-2 text-xs leading-5 text-stone-400">Payment submitted — verification pending</p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Order Timeline</h2>
              <ol className="mt-5 space-y-0">
                {statusSteps.map((step, index) => {
                  const isDone = cancelled ? step.done : index <= activeStep;
                  const Icon = step.Icon;
                  return (
                    <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < statusSteps.length - 1 && <span className={`absolute left-4 top-9 h-[calc(100%-1rem)] w-px ${isDone ? "bg-emerald-500/60" : "bg-white/10"}`} aria-hidden="true" />}
                      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-neutral-950 text-stone-600"}`}>
                        {isDone ? <Icon className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 pt-1">
                        <h3 className={`text-sm font-semibold ${isDone ? "text-white" : "text-stone-500"}`}>{step.label}</h3>
                        <p className="mt-1 text-xs leading-5 text-stone-400">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Items ({itemCount})</h2>
              <div className="mt-4 divide-y divide-white/10">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-1">
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-contain" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="wrap-break-word text-sm font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-xs text-stone-400">Quantity: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-white">{money(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                <h2 className="text-lg font-bold text-white">Delivery Address</h2>
              </div>
              <div className="mt-4 text-sm leading-6 text-stone-300">
                <p className="font-semibold text-white">{order.customer?.name}</p>
                <p className="whitespace-pre-wrap">{order.deliveryAddress?.address}</p>
                <p>{[order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(", ")}</p>
                {order.deliveryAddress?.pincode && <p>PIN {order.deliveryAddress.pincode}</p>}
                {order.customer?.phone && <p className="mt-2">{order.customer.phone}</p>}
                {order.customer?.email && <p>{order.customer.email}</p>}
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <h2 className="text-lg font-bold text-white">Order Information</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-stone-400">Order ID</dt><dd className="break-all text-right font-medium text-stone-200">{order.id}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-400">Order Date</dt><dd className="text-right text-stone-200">{formatOrderDate(order.createdAt, { dateStyle: "medium" })}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-400">Order Time</dt><dd className="text-right text-stone-200">{formatOrderDate(order.createdAt, { timeStyle: "short" })}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-400">Payment Method</dt><dd className="text-right text-stone-200">{order.payment?.method || "UPI"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-400">Delivery Option</dt><dd className="text-right text-stone-200">Standard delivery</dd></div>
              </dl>
              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between gap-3"><span className="text-stone-400">Subtotal</span><span className="text-stone-200">{money(order.subtotal)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-stone-400">Shipping</span><span className="text-stone-200">{money(order.shipping)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-stone-400">Tax</span><span className="text-stone-200">{money(order.tax)}</span></div>
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3 font-bold"><span className="text-white">Total</span><span className="text-emerald-300">{money(order.total)}</span></div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs text-amber-100">
                Amount submitted: {money(order.total)}
              </div>
            </section>

            {canCancel && (
              <button type="button" onClick={() => setCancelOpen(true)} className="min-h-12 w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 print:hidden">
                Cancel Order
              </button>
            )}
            {cancelled && order.cancellation?.cancelledAt && (
              <p className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-xs leading-5 text-rose-200">
                Cancelled {formatOrderDate(order.cancellation.cancelledAt, { dateStyle: "medium", timeStyle: "short" })}. Reason: {order.cancellation.reason}
              </p>
            )}
          </aside>
        </div>
      </div>

      {(cancelOpen || cancelledConfirmation) && (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelledConfirmation) setCancelOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-title" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            {cancelledConfirmation ? (
              <div className="py-4 text-center">
                <Check className="mx-auto h-10 w-10 rounded-full bg-emerald-400/10 p-2 text-emerald-300" aria-hidden="true" />
                <h2 id="cancel-title" className="mt-4 text-xl font-bold text-white">Your order has been cancelled successfully.</h2>
                <button type="button" onClick={() => { setCancelledConfirmation(false); setCancelOpen(false); }} className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="cancel-title" className="text-xl font-bold text-white">Cancel Order</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-400">Are you sure you want to cancel this order? Please tell us why.</p>
                  </div>
                  <button type="button" aria-label="Close cancellation dialog" onClick={() => setCancelOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><X className="h-5 w-5" aria-hidden="true" /></button>
                </div>
                <fieldset className="mt-5 space-y-2">
                  <legend className="sr-only">Cancellation reason</legend>
                  {CANCEL_REASONS.map((reason) => (
                    <label key={reason} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm text-stone-200 hover:bg-white/3">
                      <input type="radio" name="cancellation-reason" value={reason} checked={cancelReason === reason} onChange={() => { setCancelReason(reason); setCancelError(""); }} className="h-4 w-4 accent-emerald-500" />
                      {reason}
                    </label>
                  ))}
                </fieldset>
                {cancelReason === "Other" && (
                  <div className="mt-4">
                    <label htmlFor="other-cancellation-reason" className="mb-2 block text-sm font-semibold text-stone-200">Please describe your reason *</label>
                    <textarea id="other-cancellation-reason" rows={3} value={otherReason} onChange={(event) => { setOtherReason(event.target.value); setCancelError(""); }} placeholder="Enter your reason for cancellation" className="w-full resize-y rounded-xl border border-white/15 bg-neutral-950 px-3 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
                  </div>
                )}
                {cancelError && <p role="alert" className="mt-3 text-sm text-rose-300">{cancelError}</p>}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setCancelOpen(false)} className="min-h-11 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/5">Keep Order</button>
                  <button type="button" onClick={handleCancelOrder} className="min-h-11 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Confirm Cancellation</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default OrderDetails;