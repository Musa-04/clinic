import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Lock,
  MapPin,
  CreditCard,
  ClipboardCheck,
  Truck,
  ShieldCheck,
  RotateCcw,
  Copy,
  CheckCircle2,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import {
  calculateOrderTotals,
  generateOrderId,
  saveOrder,
} from "../utils/orderStorage";

export const CLINIC_UPI_ID = "YOUR-UPI-ID@upi";

const validateIndianPhone = (num) => {
  const cleaned = num.replace(/[^0-9]/g, "");

  if (cleaned.length === 10) return true;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return true;
  if (cleaned.length === 11 && cleaned.startsWith("0")) return true;

  return false;
};

const validatePincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

const validateEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Checkout = ({ onOrderPlaced, onClose, onViewOrders }) => {
  const {
    checkoutOpen,
    closeCheckout,
    clear,
    items,
    subtotal,
    setCustomerDetails,
    setCheckoutPrepared,
  } = useCart();

  // --------------------------------------------------
  // CHECKOUT STEP
  // 1 = Delivery
  // 2 = Payment
  // 3 = Review
  // --------------------------------------------------

  const [currentStep, setCurrentStep] = useState(1);

  // --------------------------------------------------
  // CUSTOMER / DELIVERY DETAILS
  // --------------------------------------------------

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
    message: "",
  });

  const [errors, setErrors] = useState({});

  // --------------------------------------------------
  // PAYMENT
  // --------------------------------------------------

  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [transactionId, setTransactionId] = useState("");

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  // --------------------------------------------------
  // ORDER STATUS
  // --------------------------------------------------

  const [orderPlaced, setOrderPlaced] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");

  // --------------------------------------------------
  // UPI ID
  // --------------------------------------------------
  // Replace this later with the clinic's real UPI ID.
  // --------------------------------------------------
  // DELIVERY
  // --------------------------------------------------

  const { subtotal: calculatedSubtotal, shipping, tax, total: totalAmount } =
    calculateOrderTotals(items);
  const isFreeDelivery = shipping === 0;

  // --------------------------------------------------
  // RESET WHEN CHECKOUT OPENS
  // --------------------------------------------------

  useEffect(() => {
    if (!checkoutOpen) return;

    setCurrentStep(1);
    setErrors({});
    setOrderPlaced(false);
    setOrderNumber("");
    setOrderError("");
    setPaymentConfirmed(false);
    setTransactionId("");
    setCopied(false);

    setTimeout(() => {
      document.getElementById("checkout-fullName")?.focus();
    }, 100);
  }, [checkoutOpen]);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // --------------------------------------------------
  // DELIVERY VALIDATION
  // --------------------------------------------------

  const validateDelivery = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!validateIndianPhone(form.phone)) {
      newErrors.phone = "Enter a valid Indian phone number.";
    }

    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Delivery address is required.";
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required.";
    } else if (!validatePincode(form.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode.";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!form.state.trim()) {
      newErrors.state = "State is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // GO TO PAYMENT
  // --------------------------------------------------

  const handleDeliverySubmit = (event) => {
    event.preventDefault();

    if (!items || items.length === 0) {
      return;
    }

    if (!validateDelivery()) {
      return;
    }

    setCustomerDetails({
      ...form,
    });

    setCheckoutPrepared(true);

    setCurrentStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // COPY UPI ID
  // --------------------------------------------------

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(CLINIC_UPI_ID);

      setCopied(true);
      setCopyError("");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      setCopyError("Copy is unavailable. Select the UPI ID to copy it manually.");
    }
  };

  // --------------------------------------------------
  // PAYMENT CONTINUE
  // --------------------------------------------------

  const handlePaymentContinue = () => {
    if (
      paymentMethod !== "upi" ||
      !paymentConfirmed ||
      !transactionId.trim()
    ) {
      return;
    }

    setCurrentStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // PLACE ORDER
  // --------------------------------------------------

  const handlePlaceOrder = () => {
    if (!items?.length || !validateDelivery()) {
      return;
    }

    if (paymentMethod !== "upi" || !transactionId.trim() || !paymentConfirmed) {
      setOrderError("Enter your transaction ID and confirm your UPI payment.");
      setCurrentStep(2);
      return;
    }

    const now = new Date().toISOString();
    const order = {
      id: generateOrderId(),
      createdAt: now,
      customer: {
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      },
      deliveryAddress: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country,
      },
      items: items.map(({ id, name, image, price, quantity }) => ({
        id,
        name,
        image,
        price: Number(price) || 0,
        quantity: Number(quantity) || 1,
      })),
      subtotal: calculatedSubtotal,
      shipping,
      tax,
      total: totalAmount,
      payment: {
        method: "UPI",
        transactionId: transactionId.trim(),
        status: "Pending Verification",
      },
      orderStatus: "Placed",
      cancellation: {
        cancelled: false,
        reason: "",
        cancelledAt: null,
      },
    };

    try {
      saveOrder(order);
      setOrderNumber(order.id);
      setOrderPlaced(true);
      clear();
      closeCheckout();
      onOrderPlaced?.(order);
    } catch {
      setOrderError("We could not save your order. Please try again.");
    }
  };

  // --------------------------------------------------
  // BACK STEP
  // --------------------------------------------------

  const handleBack = () => {
    if (currentStep === 1) {
      closeCheckout();
      onClose?.();
      return;
    }

    setCurrentStep((previous) => Math.max(1, previous - 1));
  };

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (!checkoutOpen) {
    return null;
  }

  if (!items || items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-stone-400">
            Add a product to your cart before proceeding to checkout.
          </p>

          <button
            type="button"
            onClick={() => {
              closeCheckout();
              onClose?.();
            }}
            className="mt-6 min-h-12 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-8">
        <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-neutral-900 p-8 text-center shadow-2xl sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-700" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-white">
              Order Placed Successfully
            </h1>

            <p className="mt-3 text-stone-300">
              Thank you for ordering from Malik's Polyclinic.
            </p>

            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-neutral-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Order Number
              </p>

              <p className="mt-1 text-xl font-extrabold text-emerald-700">
                {orderNumber}
              </p>

              <div className="mt-4 border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400">
                    Total
                  </span>

                  <span className="font-bold text-white">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-stone-500">
              Your order details and payment information have been recorded.
              Our team will process your order.
            </p>

            <button
              type="button"
              onClick={closeCheckout}
              className="mt-7 rounded-xl bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => {
                closeCheckout();
                onViewOrders?.();
              }}
              className="mt-3 rounded-xl border border-stone-300 px-8 py-3.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
            >
              Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN CHECKOUT
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
      <div className="min-h-full bg-neutral-950 text-stone-100 [&_.bg-white]:bg-neutral-900 [&_.bg-stone-50]:bg-neutral-950 [&_.bg-stone-100]:bg-neutral-800 [&_.border-stone-200]:border-white/10 [&_.border-stone-300]:border-white/15 [&_.text-stone-900]:text-white [&_.text-stone-800]:text-stone-100 [&_.text-stone-700]:text-stone-200 [&_.text-stone-600]:text-stone-300 [&_.text-stone-500]:text-stone-400 [&_.text-emerald-700]:text-emerald-300 [&_.bg-emerald-100]:bg-emerald-400/10 [&_input]:bg-neutral-950 [&_textarea]:bg-neutral-950 [&_input]:text-white [&_textarea]:text-white">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />

                {currentStep === 1
                  ? "Back to Cart"
                  : "Back"}
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                <Lock className="h-4 w-4 text-emerald-600" />
                Secure Checkout
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================
            CHECKOUT STEPS
        ================================================== */}

        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 sm:gap-8">
              {/* STEP 1 */}

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    currentStep >= 1
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-300 text-stone-500"
                  }`}
                >
                  {currentStep > 1 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "1"
                  )}
                </div>

                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    currentStep >= 1
                      ? "text-stone-900"
                      : "text-stone-500"
                  }`}
                >
                  Delivery Details
                </span>
              </div>

              <div className="h-px w-8 bg-stone-300 sm:w-16" />

              {/* STEP 2 */}

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    currentStep >= 2
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-300 text-stone-500"
                  }`}
                >
                  {currentStep > 2 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>

                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    currentStep >= 2
                      ? "text-stone-900"
                      : "text-stone-500"
                  }`}
                >
                  Payment Details
                </span>
              </div>

              <div className="h-px w-8 bg-stone-300 sm:w-16" />

              {/* STEP 3 */}

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    currentStep >= 3
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-300 text-stone-500"
                  }`}
                >
                  3
                </div>

                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    currentStep >= 3
                      ? "text-stone-900"
                      : "text-stone-500"
                  }`}
                >
                  Review Order
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="lg:col-span-8">
              {/* ================================================
                  STEP 1 — DELIVERY
              ================================================ */}

              {currentStep === 1 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
                  <div className="mb-8 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <MapPin className="h-5 w-5 text-emerald-700" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
                        Delivery Details
                      </h1>

                      <p className="mt-1 text-sm text-stone-500">
                        Enter your details and delivery address.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleDeliverySubmit}
                    className="space-y-6"
                  >
                    {/* Customer Details */}

                    <div>
                      <h2 className="mb-4 border-b border-stone-200 pb-3 text-sm font-bold uppercase tracking-wider text-stone-800">
                        Customer Details
                      </h2>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Name */}

                        <div>
                          <label
                            htmlFor="checkout-fullName"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Full Name *
                          </label>

                          <input
                            id="checkout-fullName"
                            type="text"
                            value={form.fullName}
                            onChange={(e) =>
                              handleChange(
                                "fullName",
                                e.target.value
                              )
                            }
                            placeholder="Enter your full name"
                            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />

                          {errors.fullName && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Phone */}

                        <div>
                          <label
                            htmlFor="checkout-phone"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Phone Number *
                          </label>

                          <input
                            id="checkout-phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) =>
                              handleChange(
                                "phone",
                                e.target.value
                              )
                            }
                            placeholder="+91 98765 43210"
                            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />

                          {errors.phone && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        {/* Email */}

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="checkout-email"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Email
                          </label>

                          <input
                            id="checkout-email"
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              handleChange(
                                "email",
                                e.target.value
                              )
                            }
                            placeholder="Enter your email address"
                            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />

                          {errors.email && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Details */}

                    <div>
                      <h2 className="mb-4 border-b border-stone-200 pb-3 text-sm font-bold uppercase tracking-wider text-stone-800">
                        Delivery Details
                      </h2>

                      <div className="space-y-5">
                        {/* Address */}

                        <div>
                          <label
                            htmlFor="checkout-address"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Address *
                          </label>

                          <textarea
                            id="checkout-address"
                            rows={4}
                            value={form.address}
                            onChange={(e) =>
                              handleChange(
                                "address",
                                e.target.value
                              )
                            }
                            placeholder="Enter your complete delivery address"
                            className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />

                          {errors.address && (
                            <p className="mt-1 text-xs text-rose-600">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        {/* Pincode + City */}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="checkout-pincode"
                              className="mb-1.5 block text-sm font-semibold text-stone-700"
                            >
                              Postal Code (ZIP/PIN) *
                            </label>

                            <input
                              id="checkout-pincode"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={form.pincode}
                              onChange={(e) =>
                                handleChange(
                                  "pincode",
                                  e.target.value.replace(
                                    /\D/g,
                                    ""
                                  )
                                )
                              }
                              placeholder="Enter your pin code"
                              className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />

                            {errors.pincode && (
                              <p className="mt-1 text-xs text-rose-600">
                                {errors.pincode}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-city"
                              className="mb-1.5 block text-sm font-semibold text-stone-700"
                            >
                              City *
                            </label>

                            <input
                              id="checkout-city"
                              type="text"
                              value={form.city}
                              onChange={(e) =>
                                handleChange(
                                  "city",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your city"
                              className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />

                            {errors.city && (
                              <p className="mt-1 text-xs text-rose-600">
                                {errors.city}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* State + Country */}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="checkout-state"
                              className="mb-1.5 block text-sm font-semibold text-stone-700"
                            >
                              State *
                            </label>

                            <input
                              id="checkout-state"
                              type="text"
                              value={form.state}
                              onChange={(e) =>
                                handleChange(
                                  "state",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your state"
                              className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />

                            {errors.state && (
                              <p className="mt-1 text-xs text-rose-600">
                                {errors.state}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-country"
                              className="mb-1.5 block text-sm font-semibold text-stone-700"
                            >
                              Country
                            </label>

                            <input
                              id="checkout-country"
                              type="text"
                              value={form.country}
                              readOnly
                              className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm text-stone-600 outline-none"
                            />
                          </div>
                        </div>

                        {/* Additional Message */}

                        <div>
                          <label
                            htmlFor="checkout-message"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Order Instructions
                          </label>

                          <textarea
                            id="checkout-message"
                            rows={3}
                            value={form.message}
                            onChange={(e) =>
                              handleChange(
                                "message",
                                e.target.value
                              )
                            }
                            placeholder="Any additional instructions for your order..."
                            className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Continue */}

                    <button
                      type="submit"
                      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      Deliver to this address
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </button>
                  </form>
                </div>
              )}

              {/* ================================================
                  STEP 2 — PAYMENT
              ================================================ */}

              {currentStep === 2 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
                  <div className="mb-8 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <CreditCard className="h-5 w-5 text-emerald-700" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
                        Payment Details
                      </h1>

                      <p className="mt-1 text-sm text-stone-500">
                        Choose your payment method and complete the payment.
                      </p>
                    </div>
                  </div>

                  {/* Delivery Method */}

                  <div>
                    <h2 className="mb-4 text-sm font-bold text-stone-800">
                      Choose delivery method
                    </h2>

                    <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full border-4 border-emerald-600 bg-white" />

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-stone-900">
                              Standard Delivery
                            </h3>

                            <span className="font-bold text-emerald-700">
                              - FREE
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-stone-500">
                            Standard shipping for your order
                          </p>

                          <p className="mt-2 text-xs font-semibold text-stone-600">
                            Delivery details will be confirmed after order placement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}

                  <div className="mt-8">
                    <h2 className="mb-4 text-sm font-bold text-stone-800">
                      Choose Payment Method
                    </h2>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`w-full rounded-2xl border-2 p-5 text-left transition ${
                        paymentMethod === "upi"
                          ? "border-emerald-600 bg-emerald-50/40"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            paymentMethod === "upi"
                              ? "border-emerald-600"
                              : "border-stone-400"
                          }`}
                        >
                          {paymentMethod === "upi" && (
                            <div className="h-2 w-2 rounded-full bg-emerald-600" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-stone-900">
                            Pay directly via UPI
                          </h3>

                          <p className="mt-1 text-sm text-stone-500">
                            Complete payment using the clinic's UPI details.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* UPI Payment Panel */}

                    {paymentMethod === "upi" && (
                      <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                              UPI ID
                            </p>

                            <p className="mt-1 break-all font-bold text-stone-900">
                              {CLINIC_UPI_ID}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-100"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                        {copyError && (
                          <p role="status" className="mt-2 text-xs text-amber-700">
                            {copyError}
                          </p>
                        )}

                        <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                          <p className="text-sm font-semibold text-stone-800">
                            Pay ₹
                            {totalAmount.toLocaleString("en-IN")} using any
                            UPI app.
                          </p>

                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            After completing the payment, enter your
                            transaction ID below and confirm the payment.
                          </p>
                        </div>

                        <div className="mt-4 grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-[9rem_1fr] sm:items-center">
                          <div className="flex aspect-square w-full max-w-36 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3 text-center text-xs font-medium text-stone-500">
                            QR payment setup pending
                          </div>
                          <ol className="list-inside list-decimal space-y-2 text-xs leading-5 text-stone-600">
                            <li>Open your UPI app and pay the displayed amount.</li>
                            <li>Use the clinic UPI ID shown above.</li>
                            <li>Enter the transaction ID from your receipt.</li>
                          </ol>
                        </div>

                        {/* Transaction ID */}

                        <div className="mt-5">
                          <label
                            htmlFor="transaction-id"
                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                          >
                            Transaction ID
                          </label>

                          <input
                            id="transaction-id"
                            type="text"
                            value={transactionId}
                            onChange={(e) =>
                              setTransactionId(e.target.value)
                            }
                            placeholder="Enter your UPI transaction ID"
                            className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          />

                          <p className="mt-1.5 text-xs text-stone-500">
                            Transaction ID is required to continue.
                          </p>
                        </div>

                        {/* Confirm Payment */}

                        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
                          <input
                            type="checkbox"
                            checked={paymentConfirmed}
                            onChange={(e) =>
                              setPaymentConfirmed(e.target.checked)
                            }
                            className="mt-1 h-4 w-4 accent-emerald-600"
                          />

                          <span className="text-sm leading-6 text-stone-700">
                            I confirm that I have completed the payment of{" "}
                            <strong>
                              ₹{totalAmount.toLocaleString("en-IN")}
                            </strong>{" "}
                            using UPI.
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Continue */}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="min-h-[50px] rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentContinue}
                      disabled={
                        paymentMethod === "upi" &&
                        (!paymentConfirmed ||
                          !transactionId.trim())
                      }
                      className={`min-h-[50px] rounded-xl px-7 py-3 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        paymentMethod === "upi" &&
                        (!paymentConfirmed ||
                          !transactionId.trim())
                          ? "cursor-not-allowed bg-stone-300"
                          : "bg-emerald-700 hover:bg-emerald-800"
                      }`}
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================
                  STEP 3 — REVIEW
              ================================================ */}

              {currentStep === 3 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
                  <div className="mb-8 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <ClipboardCheck className="h-5 w-5 text-emerald-700" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
                        Review your order
                      </h1>

                      <p className="mt-1 text-sm text-stone-500">
                        Check your delivery and payment details before placing
                        your order.
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}

                  <section>
                    <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                        Delivery Details
                      </h2>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                      <p className="font-bold text-stone-900">
                        {form.fullName}
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-600">
                        {form.address}
                        {"\n"}
                        {form.city}, {form.state} - {form.pincode}
                        {"\n"}
                        {form.country}
                      </p>

                      <div className="mt-4 border-t border-stone-200 pt-4 text-sm">
                        <p className="text-stone-600">
                          Phone:{" "}
                          <span className="font-semibold text-stone-900">
                            {form.phone}
                          </span>
                        </p>

                        {form.email && (
                          <p className="mt-1 text-stone-600">
                            Email:{" "}
                            <span className="font-semibold text-stone-900">
                              {form.email}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Payment Details */}

                  <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                        Payment Method
                      </h2>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <CreditCard className="h-5 w-5 text-emerald-700" />
                        </div>

                        <div>
                          <p className="font-bold text-stone-900">
                            Pay directly via UPI
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            Transaction ID:{" "}
                            {transactionId || "Not provided"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-amber-700">
                            Payment submitted — verification pending
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Order Items */}

                  <section className="mt-8">
                    <div className="mb-4 border-b border-stone-200 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                        Order Items
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => {
                        const itemTotal =
                          Number(item.price) *
                          Number(item.quantity);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4"
                          >
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-bold text-stone-900">
                                {item.name}
                              </h3>

                              <p className="mt-1 text-xs text-stone-500">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            <span className="text-sm font-bold text-stone-900">
                              ₹
                              {itemTotal.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Place Order */}

                  {orderError && (
                    <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {orderError}
                    </p>
                  )}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="min-h-[52px] rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      <Lock className="h-4 w-4" />
                      Confirm Payment & Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                RIGHT SIDE — ORDER SUMMARY
            ================================================== */}

            <aside className="lg:col-span-4">
              <div className="sticky top-5 space-y-4">
                {/* Order Summary */}

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-extrabold text-stone-900">
                    Order Summary
                  </h2>

                  {/* Products */}

                  <div className="mt-5 space-y-4">
                    {items.map((item) => {
                      const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-stone-900">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-xs text-stone-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <span className="text-sm font-bold text-stone-900">
                            ₹
                            {itemTotal.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}

                  <div className="my-5 border-t border-stone-200" />

                  {/* Subtotal */}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">
                      Subtotal
                    </span>

                    <span className="font-semibold text-stone-900">
                      ₹{Number(subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Tax */}

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-stone-600">
                      Tax
                    </span>

                    <span className="font-semibold text-stone-900">
                      ₹0
                    </span>
                  </div>

                  {/* Shipping */}

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-stone-600">
                      Shipping
                    </span>

                    <span className="font-bold text-emerald-600">
                      FREE
                    </span>
                  </div>

                  {/* Free Delivery Message */}

                  <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-start gap-2">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-xs font-semibold leading-5 text-stone-600">
                        {isFreeDelivery
                          ? "Your order is eligible for FREE delivery."
                          : "Standard delivery is currently free."}
                      </p>
                    </div>
                  </div>

                  {/* Total */}

                  <div className="mt-5 border-t border-stone-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        Total
                      </span>

                      <span className="text-xl font-extrabold text-stone-900">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security */}

                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />

                    <span className="text-sm font-semibold text-stone-700">
                      Secure order processing
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-emerald-600" />

                    <span className="text-sm font-semibold text-stone-700">
                      Return policy available
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;