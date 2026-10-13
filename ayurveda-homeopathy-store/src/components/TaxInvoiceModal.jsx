import React, { useRef } from "react";
import {
  Printer,
  X,
  Leaf,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

// ─── Clinic identity ────────────────────────────────────────────────────────
const CLINIC = {
  name: "Malik's Polyclinic",
  tagline: "Homeopathy | Ayurveda | Natural Healing",
  address: "Somwar Peth, Chikodi - 591201, Karnataka",
  phone: "+91 91486 63873",
  email: "support@malikspolyclinic.com",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const inr = (value) =>
  `₹\u00a0${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const pad = (value, length) => String(value ?? "").padStart(length, "0");

// ─── Component ───────────────────────────────────────────────────────────────
const TaxInvoiceModal = ({ order, isOpen, onClose }) => {
  const printContentRef = useRef(null);

  if (!isOpen || !order) return null;

  // ── Derived values ────────────────────────────────────────────────────────
  const items = Array.isArray(order.items) ? order.items : [];
  const lineTotal = (item) =>
    Number(item.price || 0) * Number(item.quantity || 0);

  const subtotal = Number(
    order.subtotal || items.reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const total = Number(
    order.total || Math.max(0, subtotal + shipping + tax - discount),
  );

  const digits = String(order.id || "").replace(/\D/g, "");
  const invoiceNo = `INV-${new Date(order.createdAt || Date.now())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${pad(digits.slice(-3) || "1", 3)}`;
  const orderDate = formatDate(order.createdAt);
  const invoiceDate = formatDate(Date.now());

  const paymentStatusRaw = String(order.payment?.status || "").toUpperCase();
  const paymentLabel =
    paymentStatusRaw === "VERIFIED"
      ? "Verified & Paid"
      : paymentStatusRaw === "FAILED"
        ? "Failed"
        : "Pending Verification";

  const orderStatusLabel =
    String(order.orderStatus || "Confirmed")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Print / Download PDF ──────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printContentRef.current;
    if (!content) return;

    const styleHtml = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.title = "Invoice";
    iframe.style.cssText =
      "position:fixed;left:-10000px;top:0;width:820px;height:1200px;border:0;background:#fff";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    frameDoc.open();
    frameDoc.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice ${invoiceNo}</title>${styleHtml}` +
      `<style>@page{size:A4;margin:14mm}html,body{margin:0;padding:0;background:#ffffff!important}</style>` +
      `</head><body>${content.outerHTML}</body></html>`,
    );
    frameDoc.close();

    const runPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        window.setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    };

    if (frameDoc.readyState === "complete") {
      window.setTimeout(runPrint, 300);
    } else {
      iframe.onload = () => window.setTimeout(runPrint, 300);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-black/70 p-2 backdrop-blur-sm sm:p-4 print:static print:bg-white print:p-0">
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:max-h-none print:rounded-none print:shadow-none">

        {/* ── Control bar (hidden on print) ─────────────────────── */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-stone-800">
              Order Invoice
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable invoice document ───────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-stone-50 p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0">
          <div
            ref={printContentRef}
            className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-6 font-sans text-stone-800 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
          >

            {/* ════════════════ HEADER ════════════════ */}
            <div className="flex flex-col gap-6 border-b-2 border-emerald-600 pb-6 sm:flex-row sm:items-start sm:justify-between">

              {/* Brand */}
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow">
                  <Leaf className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
                    <span className="text-stone-900">Malik&apos;s </span>
                    <span className="text-emerald-600">Polyclinic</span>
                  </h1>
                  <p className="mt-0.5 text-xs font-medium text-stone-500">
                    {CLINIC.tagline}
                  </p>
                </div>
              </div>

              {/* INVOICE heading + meta */}
              <div className="sm:text-right">
                <h2 className="text-3xl font-black tracking-widest text-emerald-700 uppercase">
                  Invoice
                </h2>
                <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs">
                  <table className="w-full">
                    <tbody>
                      {[
                        ["Invoice No.", invoiceNo],
                        ["Invoice Date", invoiceDate],
                        ["Order Date", orderDate],
                        ["Order ID", order.id],
                        ["Payment Status", paymentLabel],
                        ["Order Status", orderStatusLabel],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td className="py-0.5 pr-3 font-medium text-stone-500 whitespace-nowrap">
                            {label}
                          </td>
                          <td className="py-0.5 pr-2 text-stone-500">:</td>
                          <td className="py-0.5 font-semibold text-stone-800 break-all">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ════════════════ BILL TO / SHIP TO ════════════════ */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Bill To */}
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="border-b border-stone-200 pb-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                  Bill To
                </p>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  <p className="font-bold text-stone-900">
                    {order.customer?.name || "—"}
                  </p>
                  {order.customer?.phone && (
                    <p className="text-stone-600">
                      Phone: {order.customer.phone}
                    </p>
                  )}
                  {order.customer?.email && (
                    <p className="text-stone-600">{order.customer.email}</p>
                  )}
                  {order.deliveryAddress?.address && (
                    <p className="text-stone-600">
                      {order.deliveryAddress.address}
                    </p>
                  )}
                  <p className="text-stone-600">
                    {[
                      order.deliveryAddress?.city,
                      order.deliveryAddress?.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {order.deliveryAddress?.pincode &&
                      ` - ${order.deliveryAddress.pincode}`}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="border-b border-stone-200 pb-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase">
                  Shipping Address
                </p>
                <div className="mt-2.5 space-y-0.5 text-sm">
                  <p className="font-bold text-stone-900">
                    {order.customer?.name || "—"}
                  </p>
                  {order.customer?.phone && (
                    <p className="text-stone-600">
                      Phone: {order.customer.phone}
                    </p>
                  )}
                  {order.deliveryAddress?.address && (
                    <p className="text-stone-600">
                      {order.deliveryAddress.address}
                    </p>
                  )}
                  <p className="text-stone-600">
                    {[
                      order.deliveryAddress?.city,
                      order.deliveryAddress?.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {order.deliveryAddress?.pincode &&
                      ` - ${order.deliveryAddress.pincode}`}
                  </p>
                </div>
              </div>
            </div>

            {/* ════════════════ ITEMS TABLE ════════════════ */}
            <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-800 text-left text-xs font-bold text-white">
                    <th className="w-10 px-3 py-2.5 text-center">#</th>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="w-24 px-3 py-2.5 text-center">Quantity</th>
                    <th className="w-28 px-3 py-2.5 text-right">
                      Unit Price (₹)
                    </th>
                    <th className="w-28 px-3 py-2.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item, idx) => {
                    const qty = Number(item.quantity || 1);
                    const price = Number(item.price || 0);
                    const rowTotal = qty * price;
                    return (
                      <tr
                        key={item.id || idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-stone-50"}
                      >
                        <td className="px-3 py-2.5 text-center text-stone-500">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-stone-900">
                          {item.name}
                        </td>
                        <td className="px-3 py-2.5 text-center text-stone-700">
                          {qty}
                        </td>
                        <td className="px-3 py-2.5 text-right text-stone-700">
                          {price.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-stone-900">
                          {rowTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-xs text-stone-400"
                      >
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ════════════════ PAYMENT + TOTALS ════════════════ */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-start">

              {/* Payment Method */}
              <div className="rounded-lg border border-stone-200 p-4 text-sm">
                <p className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                  Payment Method
                </p>
                <p className="mt-2 font-semibold text-stone-900">
                  {order.payment?.method || "UPI / Bank Transfer"}
                </p>
                {order.payment?.transactionId && (
                  <p className="mt-1 font-mono text-xs break-all text-stone-500">
                    Ref: {order.payment.transactionId}
                  </p>
                )}
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Payment verification will be done by our team.
                </p>
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-stone-200 p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>{inr(subtotal)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping Charge</span>
                      <span>{inr(shipping)}</span>
                    </div>
                  )}
                  {shipping === 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping Charge</span>
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span>Discount</span>
                      <span>− {inr(discount)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Tax</span>
                      <span>{inr(tax)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 border border-emerald-200">
                  <span className="text-sm font-bold text-stone-900">
                    Total Amount
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {inr(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* ════════════════ NOTES ════════════════ */}
            <div className="mt-6">
              <p className="text-xs font-bold text-stone-800">
                Important Notes
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-stone-600">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                  This is a computer generated invoice.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                  Medicine dispatch will be done after payment verification.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                  For any queries, please contact us.
                </li>
              </ul>
            </div>

            {/* ════════════════ FOOTER ════════════════ */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-emerald-700 px-5 py-4 text-white sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="text-xs">
                  <p className="font-bold">Need Help?</p>
                  <p className="text-emerald-100">{CLINIC.phone}</p>
                  <p className="text-emerald-100">{CLINIC.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="text-xs">
                  <p className="font-bold">Email Us</p>
                  <p className="text-emerald-100">{CLINIC.email}</p>
                  <p className="text-emerald-100">
                    We usually respond within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="text-xs">
                  <p className="font-bold">Our Clinic</p>
                  <p className="text-emerald-100">{CLINIC.name}</p>
                  <p className="text-emerald-100">Homeopathy &amp; Ayurveda</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoiceModal;
