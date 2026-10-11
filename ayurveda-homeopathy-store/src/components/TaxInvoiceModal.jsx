import React, { useRef } from "react";
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

// Helper to convert Indian Rupees numbers to words
const numberToWordsINR = (num) => {
    const n = Math.round(Number(num) || 0);
    if (n === 0) return "Zero Rupees Only";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

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
                str += b[Math.floor(val / 10)] + (val % 10 ? " " + a[val % 10] : "") + " ";
            }
        }
        return str.trim();
    };

    return inWords(n) + " Rupees Only";
};

const TaxInvoiceModal = ({ order, isOpen, onClose }) => {
    const printContentRef = useRef(null);

    if (!isOpen || !order) return null;

    const invoiceNo = `INV-2026-${String(order.id || "").replace(/[^0-9]/g, "").slice(-4) || "0108"}`;
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const invoiceDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = Number(order.subtotal || items.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0));
    const shipping = Number(order.shipping || 0);
    const discount = Number(order.discount || 0);
    const total = Number(order.total || Math.max(0, subtotal + shipping - discount));

    // Compute GST breakdown (5% inclusive on AYUSH herbal wellness items)
    const taxableAmount = Math.round((total / 1.05) * 100) / 100;
    const totalGST = Math.round((total - taxableAmount) * 100) / 100;
    const cgst = Math.round((totalGST / 2) * 100) / 100;
    const sgst = Math.round((totalGST / 2) * 100) / 100;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col rounded-2xl bg-stone-900 border border-white/10 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:rounded-none">

                {/* Top Control Bar (Hidden when printing) */}
                <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950 px-5 py-3 text-stone-200 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950/60 print:p-0 print:bg-white">

                    {/* THE OFFICIAL TAX INVOICE DOCUMENT (Flipkart Standard) */}
                    <div
                        ref={printContentRef}
                        className="invoice-paper mx-auto max-w-[800px] bg-white text-stone-900 p-6 sm:p-8 rounded-lg shadow-md border border-stone-300 font-sans text-xs leading-relaxed print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none"
                    >
                        {/* INVOICE HEADER */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-stone-800 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold text-base">
                                        M
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-black tracking-tight text-stone-900 uppercase">
                                            Malik's Polyclinic & Pharmacy
                                        </h1>
                                        <p className="text-[10px] text-emerald-800 font-semibold tracking-wide">
                                            Homeopathy, Ayurveda & Integrated Clinical Care
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-[10.5px] text-stone-600 space-y-0.5">
                                    <p className="font-semibold text-stone-800">Malik's Healthcare Private Limited</p>
                                    <p>12, Health Enclave, Near City Civil Hospital, Medical Hub</p>
                                    <p>New Delhi, Delhi - 110001, India</p>
                                    <p>
                                        <span className="font-semibold">GSTIN:</span> 07AAAAA1234A1Z5 |{" "}
                                        <span className="font-semibold">AYUSH Reg:</span> DL-AYUSH-2024-889
                                    </p>
                                    <p>
                                        <span className="font-semibold">Helpline:</span> +91 98765 43210 |{" "}
                                        <span className="font-semibold">Email:</span> support@malikspolyclinic.com
                                    </p>
                                </div>
                            </div>

                            {/* Invoice Meta Box */}
                            <div className="w-full sm:w-auto text-left sm:text-right border sm:border-0 border-stone-200 p-2 sm:p-0 rounded">
                                <span className="inline-block bg-stone-900 text-white font-black uppercase text-[11px] px-2.5 py-1 rounded tracking-wider">
                                    Tax Invoice / Bill of Supply
                                </span>
                                <div className="mt-2 text-[11px] text-stone-700 space-y-1">
                                    <p>
                                        <span className="text-stone-500 font-medium">Invoice No: </span>
                                        <strong className="text-stone-950 font-bold">{invoiceNo}</strong>
                                    </p>
                                    <p>
                                        <span className="text-stone-500 font-medium">Invoice Date: </span>
                                        <strong className="text-stone-900">{invoiceDate}</strong>
                                    </p>
                                    <p>
                                        <span className="text-stone-500 font-medium">Order ID: </span>
                                        <strong className="text-emerald-800 font-mono font-bold">{order.id}</strong>
                                    </p>
                                    <p>
                                        <span className="text-stone-500 font-medium">Order Date: </span>
                                        <span className="text-stone-900">{orderDate}</span>
                                    </p>
                                    <p>
                                        <span className="text-stone-500 font-medium">Place of Supply: </span>
                                        <span className="text-stone-900">{order.deliveryAddress?.state || "Delhi"} (Code: 07)</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BILL TO & SHIP TO SECTION */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-300 py-3 text-[11px]">
                            {/* Billing Address */}
                            <div className="border-r-0 sm:border-r border-stone-200 pr-0 sm:pr-4">
                                <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                                    Billing Details
                                </p>
                                <p className="font-bold text-stone-950 text-xs">
                                    {order.customer?.name || "Customer"}
                                </p>
                                <p className="text-stone-700 mt-0.5">{order.deliveryAddress?.address || "Address not provided"}</p>
                                <p className="text-stone-700">
                                    {[order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(", ")} - {order.deliveryAddress?.pincode}
                                </p>
                                <p className="text-stone-700 font-medium mt-1">
                                    <span className="text-stone-500">Phone: </span>{order.customer?.phone || "N/A"}
                                </p>
                                {order.customer?.email && (
                                    <p className="text-stone-700">
                                        <span className="text-stone-500">Email: </span>{order.customer.email}
                                    </p>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                                    Shipping Details
                                </p>
                                <p className="font-bold text-stone-950 text-xs">
                                    {order.customer?.name || "Customer"}
                                </p>
                                <p className="text-stone-700 mt-0.5">{order.deliveryAddress?.address || "Address not provided"}</p>
                                <p className="text-stone-700">
                                    {[order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(", ")} - {order.deliveryAddress?.pincode}
                                </p>
                                <p className="text-stone-700 font-medium mt-1">
                                    <span className="text-stone-500">Dispatch Hub: </span>Clinic Central Pharmacy, Hub #1
                                </p>
                            </div>
                        </div>

                        {/* PRODUCT ITEMS TABLE */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full border-collapse border border-stone-300 text-[10.5px]">
                                <thead>
                                    <tr className="bg-stone-100 text-stone-800 font-bold uppercase text-[9.5px] border-b border-stone-300">
                                        <th className="border border-stone-300 p-2 text-center w-8">#</th>
                                        <th className="border border-stone-300 p-2 text-left">Description of Goods</th>
                                        <th className="border border-stone-300 p-2 text-center w-16">HSN/SAC</th>
                                        <th className="border border-stone-300 p-2 text-center w-10">Qty</th>
                                        <th className="border border-stone-300 p-2 text-right w-16">Unit Rate (₹)</th>
                                        <th className="border border-stone-300 p-2 text-right w-16">Net Taxable (₹)</th>
                                        <th className="border border-stone-300 p-2 text-right w-14">GST Rate</th>
                                        <th className="border border-stone-300 p-2 text-right w-20">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const qty = Number(item.quantity || 1);
                                        const price = Number(item.price || 0);
                                        const itemTotal = qty * price;
                                        const itemTaxable = Math.round((itemTotal / 1.05) * 100) / 100;

                                        return (
                                            <tr key={idx} className="border-b border-stone-200 hover:bg-stone-50/50">
                                                <td className="border border-stone-300 p-2 text-center text-stone-600">{idx + 1}</td>
                                                <td className="border border-stone-300 p-2">
                                                    <p className="font-semibold text-stone-900">{item.name}</p>
                                                    <p className="text-[9.5px] text-stone-500">Natural Herb / Homeopathic Medicine Formulations</p>
                                                </td>
                                                <td className="border border-stone-300 p-2 text-center text-stone-600 font-mono">300490</td>
                                                <td className="border border-stone-300 p-2 text-center font-bold text-stone-900">{qty}</td>
                                                <td className="border border-stone-300 p-2 text-right text-stone-700">₹{price.toFixed(2)}</td>
                                                <td className="border border-stone-300 p-2 text-right text-stone-700">₹{itemTaxable.toFixed(2)}</td>
                                                <td className="border border-stone-300 p-2 text-right text-stone-600">5%</td>
                                                <td className="border border-stone-300 p-2 text-right font-bold text-stone-900">₹{itemTotal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* FINANCIAL SUMMARY & TOTALS */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Payment Status & Details */}
                            <div className="border border-stone-200 rounded p-3 text-[10.5px] space-y-1.5 bg-stone-50/60">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Payment & Fulfillment Summary</span>
                                </div>
                                <div className="text-stone-700 space-y-1 pt-1">
                                    <p>
                                        <span className="text-stone-500">Payment Mode: </span>
                                        <strong>{order.payment?.method || "Online / UPI"}</strong>
                                    </p>
                                    <p>
                                        <span className="text-stone-500">Transaction Ref: </span>
                                        <span className="font-mono">{order.payment?.transactionId || "Verified Clinical Receipt"}</span>
                                    </p>
                                    <p>
                                        <span className="text-stone-500">Payment Status: </span>
                                        <strong className="text-emerald-700 uppercase">
                                            {order.payment?.status === "VERIFIED" ? "Verified & Paid" : order.payment?.status || "Confirmed"}
                                        </strong>
                                    </p>
                                    <p>
                                        <span className="text-stone-500">Order Status: </span>
                                        <strong className="text-stone-900 uppercase">{order.orderStatus || "CONFIRMED"}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Price Breakdown Calculation */}
                            <div className="border border-stone-200 rounded p-3 text-[11px] bg-stone-50/60 space-y-1.5">
                                <div className="flex justify-between text-stone-700">
                                    <span>Gross Total (Taxable Items):</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-stone-700">
                                    <span>Delivery / Shipping Charges:</span>
                                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : "FREE (₹0.00)"}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-semibold">
                                        <span>Coupon / Promotional Discount:</span>
                                        <span>-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-stone-600 text-[10px] pt-1 border-t border-stone-200">
                                    <span>CGST (2.5%):</span>
                                    <span>₹{cgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-stone-600 text-[10px]">
                                    <span>SGST (2.5%):</span>
                                    <span>₹{sgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-stone-950 font-black text-sm pt-2 border-t-2 border-stone-900">
                                    <span>GRAND TOTAL (INCL. TAXES):</span>
                                    <span className="text-emerald-800 text-base">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* AMOUNT IN WORDS */}
                        <div className="mt-3 bg-stone-100 p-2.5 rounded border border-stone-200 text-[10.5px]">
                            <span className="font-bold text-stone-700">Amount in Words: </span>
                            <span className="font-semibold text-stone-900 italic">
                                {numberToWordsINR(total)}
                            </span>
                        </div>

                        {/* FOOTER & AUTHORIZED SIGNATURE */}
                        <div className="mt-6 pt-4 border-t border-stone-300 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end text-[10px]">
                            <div className="text-stone-500 space-y-1">
                                <p className="font-bold uppercase tracking-wide text-stone-700">Declaration & Terms:</p>
                                <p>1. All medicines sold are certified homeopathic and herbal remedies licensed by AYUSH authorities.</p>
                                <p>2. Keep medicines stored in cool, dry conditions out of reach of direct sunlight.</p>
                                <p>3. This is an electronically generated Tax Invoice and does not require a physical signature.</p>
                                <p>4. For consultation inquiries or dosage guidance, consult Dr. Mozim Malik or clinic support.</p>
                            </div>

                            <div className="text-center sm:text-right">
                                <p className="font-bold text-stone-800">For Malik's Polyclinic & Pharmacy</p>
                                <div className="my-2 inline-flex items-center justify-center border border-emerald-800/20 bg-emerald-50 px-3 py-1 rounded text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                                    <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Authorized Clinical Signatory
                                </div>
                                <p className="text-[9px] text-stone-400">Chief Pharmacy Officer / Authorized Dispenser</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaxInvoiceModal;
