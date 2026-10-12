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
  Star,
  Sparkles,
  MessageSquareHeart,
} from "lucide-react";
import TaxInvoiceModal from "../components/TaxInvoiceModal";
import {
  formatOrderDate,
  getOrderById,
  normalizePaymentStatus,
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
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackTags, setFeedbackTags] = useState([
    "Effective Medicine",
    "Quick Delivery",
  ]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
          <p className="mt-3 text-sm text-stone-400">
            This order is not available in this browser.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/orders")}
            className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
          >
            View Orders
          </button>
        </div>
      </main>
    );
  }

  const normalizedStatus = String(order.orderStatus || "PLACED").toUpperCase();
  const cancelled =
    normalizedStatus === "CANCELLED" || order.cancellation?.cancelled;
  const canCancel =
    ["PLACED", "PENDING", "CONFIRMED"].includes(normalizedStatus) && !cancelled;
  const paymentStatus = normalizePaymentStatus(order.payment?.status);
  const paymentStatusLabel =
    {
      PENDING_VERIFICATION: "Pending Verification",
      VERIFIED: "Verified",
      FAILED: "Failed",
    }[paymentStatus] || paymentStatus;
  const paymentStatusStyle =
    {
      PENDING_VERIFICATION:
        "border-amber-400/20 bg-amber-400/10 text-amber-200",
      VERIFIED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      FAILED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    }[paymentStatus] || "border-white/10 bg-white/5 text-stone-300";
  const paymentStatusDescription =
    {
      PENDING_VERIFICATION: "Payment submitted — verification pending",
      VERIFIED: "Payment manually verified by the clinic",
      FAILED: "Payment marked as failed by the clinic",
    }[paymentStatus] || "Payment status unavailable";
  const itemCount = (order.items || []).reduce(
    (count, item) => count + Number(item.quantity || 0),
    0,
  );
  const statusSteps = cancelled
    ? [
        {
          label: "Placed",
          description: "Your order was placed.",
          done: true,
          Icon: CheckCircle2,
        },
        {
          label: "Cancelled",
          description:
            order.cancellation?.reason || "This order was cancelled.",
          done: true,
          Icon: X,
        },
      ]
    : [
        {
          label: "Placed",
          description: "Your order has been placed successfully.",
          Icon: CheckCircle2,
        },
        {
          label: "Confirmed",
          description:
            "Your order has been confirmed and processing has started.",
          Icon: ClipboardList,
        },
        {
          label: "Shipped",
          description: "Your order is on its way to you.",
          Icon: Truck,
        },
        {
          label: "Delivered",
          description: "Your order has been delivered.",
          Icon: PackageCheck,
        },
      ];
  const activeStep =
    {
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
          <button
            type="button"
            onClick={() => onNavigate("/#medicines")}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-stone-300 transition hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to
            Shopping
          </button>
          <div className="flex flex-wrap gap-2">
            {["SHIPPED", "DELIVERED"].includes(normalizedStatus) && (
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <Printer
                  className="h-4 w-4 text-emerald-400"
                  aria-hidden="true"
                />{" "}
                Tax Invoice
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate("/#medicines")}
              className="min-h-10 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <header className="mb-7 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-emerald-400 uppercase">
            Order Details
          </p>
          <h1 className="mt-2 text-2xl font-bold break-all text-white sm:text-3xl">
            {order.id}
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Placed{" "}
            {formatOrderDate(order.createdAt, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="min-w-0 space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                  Order Status
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${cancelled ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}
                >
                  {cancelled
                    ? "Cancelled"
                    : normalizedStatus === "PENDING"
                      ? "Pending"
                      : normalizedStatus.charAt(0) +
                        normalizedStatus.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                  Payment Status
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${paymentStatusStyle}`}
                >
                  {paymentStatusLabel}
                </span>
                <p className="mt-2 text-xs leading-5 text-stone-400">
                  {paymentStatusDescription}
                </p>
                {order.payment?.method && (
                  <p className="mt-2 text-xs text-stone-300">
                    Method: {order.payment.method}
                  </p>
                )}
                {order.payment?.transactionId && (
                  <p className="mt-1 font-mono text-xs break-all text-stone-400">
                    Transaction ID: {order.payment.transactionId}
                  </p>
                )}
                {order.payment?.verifiedAt && (
                  <p className="mt-1 text-xs text-stone-400">
                    Verified At:{" "}
                    {formatOrderDate(order.payment.verifiedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                {order.payment?.failedAt && (
                  <p className="mt-1 text-xs text-stone-400">
                    Failed At:{" "}
                    {formatOrderDate(order.payment.failedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            </section>

            {/* CUSTOMER FEEDBACK SECTION FOR DELIVERED ORDERS */}
            {normalizedStatus === "DELIVERED" && (
              <section className="rounded-2xl border border-emerald-500/30 bg-neutral-900 p-5 shadow-lg shadow-emerald-950/20 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <MessageSquareHeart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Order Feedback & Patient Experience
                    </h2>
                    <p className="text-xs text-stone-400">
                      Your review helps our doctors improve remedies & patient
                      service
                    </p>
                  </div>
                </div>

                {order.feedback || feedbackSubmitted ? (
                  <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (order.feedback?.rating || feedbackRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-600"
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-bold text-amber-300">
                          {order.feedback?.rating || feedbackRating} / 5 Stars
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        Feedback Recorded
                      </span>
                    </div>

                    <p className="mt-3 text-stone-200 italic">
                      "
                      {order.feedback?.comment ||
                        feedbackComment ||
                        "Great products and natural wellness support."}
                      "
                    </p>

                    {Array.isArray(order.feedback?.tags || feedbackTags) &&
                      (order.feedback?.tags || feedbackTags).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(order.feedback?.tags || feedbackTags).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10.5px] text-stone-300"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    <p className="mt-2 text-[10px] text-stone-500">
                      Submitted on{" "}
                      {formatOrderDate(
                        order.feedback?.submittedAt || new Date().toISOString(),
                        { dateStyle: "medium" },
                      )}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const feedbackData = {
                        rating: feedbackRating,
                        comment:
                          feedbackComment.trim() ||
                          "Medicine was effective and well packaged.",
                        tags: feedbackTags,
                        submittedAt: new Date().toISOString(),
                      };
                      const updated = updateOrder(order.id, {
                        feedback: feedbackData,
                      });
                      if (updated) {
                        setOrder(updated);
                        setFeedbackSubmitted(true);
                      }
                    }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-300">
                        Rate Your Experience:
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 transition hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= feedbackRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-600 hover:text-amber-400/50"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-amber-300">
                          {feedbackRating === 5
                            ? "Excellent ⭐⭐⭐⭐⭐"
                            : feedbackRating === 4
                              ? "Very Good ⭐⭐⭐⭐"
                              : feedbackRating === 3
                                ? "Good ⭐⭐⭐"
                                : "Could Be Better"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-stone-300">
                        Quick Feedback Highlights:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Effective Medicine",
                          "Quick Delivery",
                          "Authentic Packaging",
                          "Helpful Dosage Instructions",
                          "Value for Money",
                        ].map((tag) => {
                          const active = feedbackTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setFeedbackTags((prev) =>
                                  prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag],
                                );
                              }}
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                active
                                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                                  : "border border-white/10 bg-neutral-950 text-stone-400 hover:text-white"
                              }`}
                            >
                              {active ? "✓ " : "+ "}
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="feedback-comment"
                        className="mb-1.5 block text-xs font-semibold text-stone-300"
                      >
                        Your Feedback / Remedy Experience:
                      </label>
                      <textarea
                        id="feedback-comment"
                        rows={3}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Share your experience regarding the medicines, relief observed, or delivery..."
                        className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Submit Order Feedback</span>
                    </button>
                  </form>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Order Timeline</h2>
              <ol className="mt-5 space-y-0">
                {statusSteps.map((step, index) => {
                  const isDone = cancelled ? step.done : index <= activeStep;
                  const Icon = step.Icon;
                  return (
                    <li
                      key={step.label}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index < statusSteps.length - 1 && (
                        <span
                          className={`absolute top-9 left-4 h-[calc(100%-1rem)] w-px ${isDone ? "bg-emerald-500/60" : "bg-white/10"}`}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-neutral-950 text-stone-600"}`}
                      >
                        {isDone ? (
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Circle className="h-3 w-3" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 pt-1">
                        <h3
                          className={`text-sm font-semibold ${isDone ? "text-white" : "text-stone-500"}`}
                        >
                          {step.label}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-stone-400">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">
                Items ({itemCount})
              </h2>
              <div className="mt-4 divide-y divide-white/10">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold wrap-break-word text-white">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-stone-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-white">
                      {money(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <MapPin
                  className="h-5 w-5 shrink-0 text-emerald-300"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-bold text-white">
                  Delivery Address
                </h2>
              </div>
              <div className="mt-4 text-sm leading-6 text-stone-300">
                <p className="font-semibold text-white">
                  {order.customer?.name}
                </p>
                <p className="whitespace-pre-wrap">
                  {order.deliveryAddress?.address}
                </p>
                <p>
                  {[order.deliveryAddress?.city, order.deliveryAddress?.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.deliveryAddress?.pincode && (
                  <p>PIN {order.deliveryAddress.pincode}</p>
                )}
                {order.customer?.phone && (
                  <p className="mt-2">{order.customer.phone}</p>
                )}
                {order.customer?.email && <p>{order.customer.email}</p>}
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <h2 className="text-lg font-bold text-white">
                Order Information
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-400">Order ID</dt>
                  <dd className="text-right font-medium break-all text-stone-200">
                    {order.id}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-400">Order Date</dt>
                  <dd className="text-right text-stone-200">
                    {formatOrderDate(order.createdAt, { dateStyle: "medium" })}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-400">Order Time</dt>
                  <dd className="text-right text-stone-200">
                    {formatOrderDate(order.createdAt, { timeStyle: "short" })}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-400">Payment Method</dt>
                  <dd className="text-right text-stone-200">
                    {order.payment?.method || "UPI"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-400">Delivery Option</dt>
                  <dd className="text-right text-stone-200">
                    Standard delivery
                  </dd>
                </div>
              </dl>
              <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-400">Subtotal</span>
                  <span className="text-stone-200">
                    {money(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-400">Shipping</span>
                  <span className="text-stone-200">
                    {money(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-400">Tax</span>
                  <span className="text-stone-200">{money(order.tax)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-white/10 pt-3 font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-300">{money(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs text-amber-100">
                Amount submitted: {money(order.total)}
              </div>
            </section>

            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="min-h-12 w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none print:hidden"
              >
                Cancel Order
              </button>
            )}
            {cancelled && order.cancellation?.cancelledAt && (
              <p className="rounded-xl border border-rose-400/15 bg-rose-400/5 p-4 text-xs leading-5 text-rose-200">
                Cancelled{" "}
                {formatOrderDate(order.cancellation.cancelledAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                . Reason: {order.cancellation.reason}
              </p>
            )}
          </aside>
        </div>
      </div>

      {(cancelOpen || cancelledConfirmation) && (
        <div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancelledConfirmation)
              setCancelOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            {cancelledConfirmation ? (
              <div className="py-4 text-center">
                <Check
                  className="mx-auto h-10 w-10 rounded-full bg-emerald-400/10 p-2 text-emerald-300"
                  aria-hidden="true"
                />
                <h2
                  id="cancel-title"
                  className="mt-4 text-xl font-bold text-white"
                >
                  Your order has been cancelled successfully.
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setCancelledConfirmation(false);
                    setCancelOpen(false);
                  }}
                  className="mt-6 min-h-12 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="cancel-title"
                      className="text-xl font-bold text-white"
                    >
                      Cancel Order
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      Are you sure you want to cancel this order? Please tell us
                      why.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close cancellation dialog"
                    onClick={() => setCancelOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <fieldset className="mt-5 space-y-2">
                  <legend className="sr-only">Cancellation reason</legend>
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm text-stone-200 hover:bg-white/3"
                    >
                      <input
                        type="radio"
                        name="cancellation-reason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={() => {
                          setCancelReason(reason);
                          setCancelError("");
                        }}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      {reason}
                    </label>
                  ))}
                </fieldset>
                {cancelReason === "Other" && (
                  <div className="mt-4">
                    <label
                      htmlFor="other-cancellation-reason"
                      className="mb-2 block text-sm font-semibold text-stone-200"
                    >
                      Please describe your reason *
                    </label>
                    <textarea
                      id="other-cancellation-reason"
                      rows={3}
                      value={otherReason}
                      onChange={(event) => {
                        setOtherReason(event.target.value);
                        setCancelError("");
                      }}
                      placeholder="Enter your reason for cancellation"
                      className="w-full resize-y rounded-xl border border-white/15 bg-neutral-950 px-3 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none"
                    />
                  </div>
                )}
                {cancelError && (
                  <p role="alert" className="mt-3 text-sm text-rose-300">
                    {cancelError}
                  </p>
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setCancelOpen(false)}
                    className="min-h-11 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-white/5"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="min-h-11 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:outline-none"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {/* Tax Invoice Modal (Flipkart / E-Commerce Standard) */}
      <TaxInvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </main>
  );
};

export default OrderDetails;
