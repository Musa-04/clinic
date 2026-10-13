import React, { useRef } from "react";
import {
  Printer,
  X,
  Leaf,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

/**
 * InvoiceModal — a clean, customer-friendly invoice (light theme).
 * ────────────────────────────────────────────────────────────────
 * Renders a professional order invoice for Malik's Polyclinic and
 * supports Print / Save-as-PDF via a hidden iframe that copies the
 * app's compiled styles so the document renders identically on paper.
 *
 * Props:
 *   order   – the canonical order object (see utils/orderStorage.js)
 *   isOpen  – boolean, whether the modal is visible
 *   onClose – callback to close the modal
 */

// Clinic identity — edit these in one place if the details change.
const CLINIC = {
  name: "Malik's Polyclinic",
  tagline: "Homeopathy | Ayurveda | Natural Healing",
  address: "Somwar Peth, Chikodi - 591201, Karnataka",
  phone: "+91 91486 63873",
  email: "support@malikspolyclinic.com",
};

const pad = (value, length) => String(value ?? "").padStart(length, "0");

const inr = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const InvoiceModal = ({ order, isOpen, onClose }) => {
  const printContentRef = useRef(null);

  if (!isOpen || !order) return null;

  // ----- Derived values -------------------------------------------------
  const items = Array.isArray(order.items) ? order.items : [];
  const lineTotal = (item) =>
    Number(item.price || 0) * Number(item.quantity || 0);

  const subtotal = Number(
    order.subtotal || items.reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);
  const total = Number(
    order.total || Math.max(0, subtotal + shipping - discount),
  );

  const digits = String(order.id || "").replace(/\D/g, "");
  const invoiceNo = `INV-${new Date(order.createdAt || Date.now())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${pad(digits.slice(-3) || "1", 3)}`;
  const orderDate = formatDate(order.createdAt);

  const statusKey = String(order.payment?.status || "").toUpperCase();
  const paymentLabel =
    statusKey === "VERIFIED"
      ? "Paid"
      : statusKey === "FAILED"
        ? "Failed"
        : "Pending";
  const orderStatus = titleCase(order.orderStatus || "Confirmed");

  const paymentMethod = order.payment?.method || "UPI / Bank Transfer";

  // ----- Print / Download PDF ------------------------------------------
  const handlePrint = () => {
    const content = printContentRef.current;
    if (!content) return;

    // Copy the app's compiled stylesheets so the invoice looks the same
    // inside the isolated print document (Vite injects <style> in dev and
    // a <link> in production, so we gather both).
    const styleHtml = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.title = "Invoice";
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "820px";
    iframe.style.height = "1200px";
    iframe.style.border = "0";
    iframe.style.background = "#ffffff";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    frameDoc.open();
    frameDoc.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Invoice ${invoiceNo}</title>${styleHtml}` +
        `<style>@page{size:A4;margin:14mm}html,body{margin:0;padding:0;background:#ffffff !important}</style>` +
        `</head><body>${content.outerHTML}</body></html>`,
    );

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-black/70 p-2 backdrop-blur-sm sm:p-4 print:static print:bg-white print:p-0">
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:max-h-none print:rounded-none print:shadow-none">
        {/* Control bar (hidden on print) */}
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
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

        {/* Scrollable invoice document */}
        <div className="flex-1 overflow-y-auto bg-stone-50 p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0">
          <div
            ref={printContentRef}
            className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-5 text-stone-800 sm:p-8 print:rounded-none print:border-0 print:p-0"
          >
            {/* ================= HEADER ================= */}
            <div className="flex flex-col gap-5 border-b-2 border-emerald-600 pb-5 sm:flex-row sm:items-start sm:justify-between">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm">
                  <Leaf className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-emerald-700 sm:text-2xl">
                    {CLINIC.name}
                  </h1>
                  <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-stone-500">
                    {CLINIC.tagline}
                  </p>
                </div>
              </div>

              {/* Invoice title + meta */}
              <div className="sm:text-right">
                <h2 className="text-2xl font-extrabold tracking-widest text-emerald-700 uppercase sm:text-3xl">
                  Invoice
                </h2>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-emerald-50/70 p-3 text-[12px] sm:grid-cols-1 sm:justify-items-end">
                  <div className="flex justify-between gap-3 sm:justify-end">
                    <dt className="font-medium text-stone-500">
                      Invoice No.
                    </dt>
                    <dd className="font-bold text-stone-800">{invoiceNo}</dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:justify-end">
                    <dt className="font-medium text-stone-500">Order Date</dt>
                    <dd className="font-semibold text-stone-700">
                      {orderDate}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:justify-end">
                    <dt className="font-medium text-stone-500">Order ID</dt>
                    <dd className="font-mono font-bold text-emerald-700">
                      {order.id}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:justify-end">
                    <dt className="font-medium text-stone-500">
                      Payment Status
                    </dt>
                    <dd className="font-semibold text-stone-800">
                      {paymentLabel}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:justify-end">
                    <dt className="font-medium text-stone-500">
                      Order Status
                    </dt>
                    <dd className="font-semibold text-stone-800">
                      {orderStatus}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

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
