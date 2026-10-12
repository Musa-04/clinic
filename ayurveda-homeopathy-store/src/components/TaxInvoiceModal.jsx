import React, { useRef } from "react";
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

// Helper to convert Indian Rupees numbers to words
const numberToWordsINR = (num) => {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (val) => {
    let str = "";
    if (val >= 10000000) {
      str += inWords(Math.floor(val / 10000000)) + " Crore ";
      val %= 10000000;
    }
    if (val >= 100000) {
      str += inWords(Math.floor(val / 100000)) + " Lakh ";
      val %= 100000;
    }
    if (val >= 1000) {
      str += inWords(Math.floor(val / 1000)) + " Thousand ";
      val %= 1000;
    }
    if (val >= 100) {
      str += inWords(Math.floor(val / 100)) + " Hundred ";
      val %= 100;
    }
    if (val > 0) {
      if (str !== "") str += "and ";
      if (val < 20) {
        str += a[val] + " ";
      } else {
        str +=
          b[Math.floor(val / 10)] + (val % 10 ? " " + a[val % 10] : "") + " ";
      }
    }
    return str.trim();
  };

  return inWords(n) + " Rupees Only";
};

const TaxInvoiceModal = ({ order, isOpen, onClose }) => {
  const printContentRef = useRef(null);

  if (!isOpen || !order) return null;

  const invoiceNo = `INV-2026-${
    String(order.id || "")
      .replace(/[^0-9]/g, "")
      .slice(-4) || "0108"
  }`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(
    order.subtotal ||
      items.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
        0,
      ),
  );
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);
  const total = Number(
    order.total || Math.max(0, subtotal + shipping - discount),
  );

  // Compute GST breakdown (5% inclusive on AYUSH herbal wellness items)
  const taxableAmount = Math.round((total / 1.05) * 100) / 100;
  const totalGST = Math.round((total - taxableAmount) * 100) / 100;
  const cgst = Math.round((totalGST / 2) * 100) / 100;
  const sgst = Math.round((totalGST / 2) * 100) / 100;

  const handlePrint = () => {
    const content = printContentRef.current;
    if (!content) return;

    // Collect the app's compiled stylesheets so the invoice renders identically
    // inside the isolated print document (Vite injects <style> in dev and a
    // <link> in production, so we copy both).
    const styleHtml = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    // Use a hidden iframe so we print ONLY the invoice, never the rest of the
    // page. It is sized like a desktop viewport (but kept off-screen) so the
    // invoice's responsive (sm:/md:) layout renders in its desktop form.
    const iframe = document.createElement("iframe");
    iframe.title = "Tax Invoice";
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
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Tax Invoice</title>${styleHtml}` +
        `<style>@page{size:A4;margin:14mm}html,body{margin:0;padding:0;background:#ffffff !important}</style>` +
        `</head><body>${content.outerHTML}</body></html>`,
    );
    frameDoc.close();

    const runPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        // Clean up the iframe shortly after the print dialog is handled.
        window.setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    };

    // Wait for the copied stylesheets to load so the invoice is fully styled
    // before the print dialog opens.
    if (frameDoc.readyState === "complete") {
      window.setTimeout(runPrint, 300);
    } else {
      iframe.onload = () => window.setTimeout(runPrint, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:p-4 print:static print:bg-white print:p-0">
      <div className="relative flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-2xl print:max-h-none print:rounded-none print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-5 py-3 text-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold tracking-wider text-stone-300 uppercase">
              Retail Tax Invoice Preview · Flipkart / E-Commerce Standard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Invoice */}
        <div className="flex-1 overflow-y-auto bg-stone-950/60 p-4 sm:p-6 print:bg-white print:p-0">
          {/* THE OFFICIAL TAX INVOICE DOCUMENT (Flipkart Standard) */}
          <div
            ref={printContentRef}
            className="invoice-paper mx-auto max-w-[800px] rounded-lg border border-stone-300 bg-white p-6 font-sans text-xs leading-relaxed text-stone-900 shadow-md sm:p-8 print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none"
          >
            {/* INVOICE HEADER */}
            <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-stone-800 pb-4 sm:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-base font-bold text-white">
                    M
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-stone-900 uppercase">
                      Malik's Polyclinic & Pharmacy
                    </h1>
                    <p className="text-[10px] font-semibold tracking-wide text-emerald-800">
                      Homeopathy, Ayurveda & Integrated Clinical Care
                    </p>
                  </div>
                </div>
                <div className="mt-2 space-y-0.5 text-[10.5px] text-stone-600">
                  <p className="font-semibold text-stone-800">
                    Malik's Healthcare Private Limited
                  </p>
                  <p>Somwar Peth, Chikodi - 591201</p>
                  <p>
                    <span className="font-semibold">Helpline:</span> +91 91486
                    63873 | <span className="font-semibold">Email:</span>{" "}
                    support@malikspolyclinic.com
                  </p>
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="w-full rounded border border-stone-200 p-2 text-left sm:w-auto sm:border-0 sm:p-0 sm:text-right">
                <span className="inline-block rounded bg-stone-900 px-2.5 py-1 text-[11px] font-black tracking-wider text-white uppercase">
                  Tax Invoice / Bill of Supply
                </span>
                <div className="mt-2 space-y-1 text-[11px] text-stone-700">
                  <p>
                    <span className="font-medium text-stone-500">
                      Invoice No:{" "}
                    </span>
                    <strong className="font-bold text-stone-950">
                      {invoiceNo}
                    </strong>
                  </p>
                  <p>
                    <span className="font-medium text-stone-500">
                      Invoice Date:{" "}
                    </span>
                    <strong className="text-stone-900">{invoiceDate}</strong>
                  </p>
                  <p>
                    <span className="font-medium text-stone-500">
                      Order ID:{" "}
                    </span>
                    <strong className="font-mono font-bold text-emerald-800">
                      {order.id}
                    </strong>
                  </p>
                  <p>
                    <span className="font-medium text-stone-500">
                      Order Date:{" "}
                    </span>
                    <span className="text-stone-900">{orderDate}</span>
                  </p>
                  <p>
                    <span className="font-medium text-stone-500">
                      Place of Supply:{" "}
                    </span>
                    <span className="text-stone-900">
                      {order.deliveryAddress?.state || "Delhi"} (Code: 07)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* BILL TO & SHIP TO SECTION */}
            <div className="grid grid-cols-1 gap-4 border-b border-stone-300 py-3 text-[11px] sm:grid-cols-2">
              {/* Billing Address */}
              <div className="border-r-0 border-stone-200 pr-0 sm:border-r sm:pr-4">
                <p className="mb-1 text-[10px] font-bold tracking-wider text-stone-500 uppercase">
                  Billing Details
                </p>
                <p className="text-xs font-bold text-stone-950">
                  {order.customer?.name || "Customer"}
                </p>
                <p className="mt-0.5 text-stone-700">
                  {order.deliveryAddress?.address || "Address not provided"}
                </p>
                <p className="text-stone-700">
                  {[order.deliveryAddress?.city, order.deliveryAddress?.state]
                    .filter(Boolean)
                    .join(", ")}{" "}
                  - {order.deliveryAddress?.pincode}
                </p>
                <p className="mt-1 font-medium text-stone-700">
                  <span className="text-stone-500">Phone: </span>
                  {order.customer?.phone || "N/A"}
                </p>
                {order.customer?.email && (
                  <p className="text-stone-700">
                    <span className="text-stone-500">Email: </span>
                    {order.customer.email}
                  </p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <p className="mb-1 text-[10px] font-bold tracking-wider text-stone-500 uppercase">
                  Shipping Details
                </p>
                <p className="text-xs font-bold text-stone-950">
                  {order.customer?.name || "Customer"}
                </p>
                <p className="mt-0.5 text-stone-700">
                  {order.deliveryAddress?.address || "Address not provided"}
                </p>
                <p className="text-stone-700">
                  {[order.deliveryAddress?.city, order.deliveryAddress?.state]
                    .filter(Boolean)
                    .join(", ")}{" "}
                  - {order.deliveryAddress?.pincode}
                </p>
                <p className="mt-1 font-medium text-stone-700">
                  <span className="text-stone-500">Dispatch Hub: </span>Clinic
                  Central Pharmacy, Hub #1
                </p>
              </div>
            </div>

            {/* PRODUCT ITEMS TABLE */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse border border-stone-300 text-[10.5px]">
                <thead>
                  <tr className="border-b border-stone-300 bg-stone-100 text-[9.5px] font-bold text-stone-800 uppercase">
                    <th className="w-8 border border-stone-300 p-2 text-center">
                      #
                    </th>
                    <th className="border border-stone-300 p-2 text-left">
                      Description of Goods
                    </th>
                    <th className="w-16 border border-stone-300 p-2 text-center">
                      HSN/SAC
                    </th>
                    <th className="w-10 border border-stone-300 p-2 text-center">
                      Qty
                    </th>
                    <th className="w-16 border border-stone-300 p-2 text-right">
                      Unit Rate (₹)
                    </th>
                    <th className="w-16 border border-stone-300 p-2 text-right">
                      Net Taxable (₹)
                    </th>
                    <th className="w-14 border border-stone-300 p-2 text-right">
                      GST Rate
                    </th>
                    <th className="w-20 border border-stone-300 p-2 text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = Number(item.quantity || 1);
                    const price = Number(item.price || 0);
                    const itemTotal = qty * price;
                    const itemTaxable =
                      Math.round((itemTotal / 1.05) * 100) / 100;

                    return (
                      <tr
                        key={idx}
                        className="border-b border-stone-200 hover:bg-stone-50/50"
                      >
                        <td className="border border-stone-300 p-2 text-center text-stone-600">
                          {idx + 1}
                        </td>
                        <td className="border border-stone-300 p-2">
                          <p className="font-semibold text-stone-900">
                            {item.name}
                          </p>
                          <p className="text-[9.5px] text-stone-500">
                            Natural Herb / Homeopathic Medicine Formulations
                          </p>
                        </td>
                        <td className="border border-stone-300 p-2 text-center font-mono text-stone-600">
                          300490
                        </td>
                        <td className="border border-stone-300 p-2 text-center font-bold text-stone-900">
                          {qty}
                        </td>
                        <td className="border border-stone-300 p-2 text-right text-stone-700">
                          ₹{price.toFixed(2)}
                        </td>
                        <td className="border border-stone-300 p-2 text-right text-stone-700">
                          ₹{itemTaxable.toFixed(2)}
                        </td>
                        <td className="border border-stone-300 p-2 text-right text-stone-600">
                          5%
                        </td>
                        <td className="border border-stone-300 p-2 text-right font-bold text-stone-900">
                          ₹{itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL SUMMARY & TOTALS */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Payment Status & Details */}
              <div className="space-y-1.5 rounded border border-stone-200 bg-stone-50/60 p-3 text-[10.5px]">
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Payment & Fulfillment Summary</span>
                </div>
                <div className="space-y-1 pt-1 text-stone-700">
                  <p>
                    <span className="text-stone-500">Payment Mode: </span>
                    <strong>{order.payment?.method || "Online / UPI"}</strong>
                  </p>
                  <p>
                    <span className="text-stone-500">Transaction Ref: </span>
                    <span className="font-mono">
                      {order.payment?.transactionId ||
                        "Verified Clinical Receipt"}
                    </span>
                  </p>
                  <p>
                    <span className="text-stone-500">Payment Status: </span>
                    <strong className="text-emerald-700 uppercase">
                      {order.payment?.status === "VERIFIED"
                        ? "Verified & Paid"
                        : order.payment?.status || "Confirmed"}
                    </strong>
                  </p>
                  <p>
                    <span className="text-stone-500">Order Status: </span>
                    <strong className="text-stone-900 uppercase">
                      {order.orderStatus || "CONFIRMED"}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Price Breakdown Calculation */}
              <div className="space-y-1.5 rounded border border-stone-200 bg-stone-50/60 p-3 text-[11px]">
                <div className="flex justify-between text-stone-700">
                  <span>Gross Total (Taxable Items):</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Delivery / Shipping Charges:</span>
                  <span>
                    {shipping > 0 ? `₹${shipping.toFixed(2)}` : "FREE (₹0.00)"}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Coupon / Promotional Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-1 text-[10px] text-stone-600">
                  <span>CGST (2.5%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-600">
                  <span>SGST (2.5%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t-2 border-stone-900 pt-2 text-sm font-black text-stone-950">
                  <span>GRAND TOTAL (INCL. TAXES):</span>
                  <span className="text-base text-emerald-800">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* AMOUNT IN WORDS */}
            <div className="mt-3 rounded border border-stone-200 bg-stone-100 p-2.5 text-[10.5px]">
              <span className="font-bold text-stone-700">
                Amount in Words:{" "}
              </span>
              <span className="font-semibold text-stone-900 italic">
                {numberToWordsINR(total)}
              </span>
            </div>

            {/* FOOTER & AUTHORIZED SIGNATURE */}
            <div className="mt-6 grid grid-cols-1 items-end gap-4 border-t border-stone-300 pt-4 text-[10px] sm:grid-cols-2">
              <div className="space-y-1 text-stone-500">
                <p className="font-bold tracking-wide text-stone-700 uppercase">
                  Declaration & Terms:
                </p>
                <p>
                  1. All medicines sold are certified homeopathic and herbal
                  remedies licensed by AYUSH authorities.
                </p>
                <p>
                  2. Keep medicines stored in cool, dry conditions out of reach
                  of direct sunlight.
                </p>
                <p>
                  3. This is an electronically generated Tax Invoice and does
                  not require a physical signature.
                </p>
                <p>
                  4. For consultation inquiries or dosage guidance, consult Dr.
                  Mozim Malik or clinic support.
                </p>
              </div>

              <div className="text-center sm:text-right">
                <p className="font-bold text-stone-800">
                  For Malik's Polyclinic & Pharmacy
                </p>
                <div className="my-2 inline-flex items-center justify-center rounded border border-emerald-800/20 bg-emerald-50 px-3 py-1 text-[9px] font-bold tracking-wider text-emerald-800 uppercase">
                  <CheckCircle2 className="mr-1 inline h-3 w-3" /> Authorized
                  Clinical Signatory
                </div>
                <p className="text-[9px] text-stone-400">
                  Chief Pharmacy Officer / Authorized Dispenser
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoiceModal;
