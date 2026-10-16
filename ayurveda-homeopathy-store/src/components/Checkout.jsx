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
  getOrders,
  saveOrder,
} from "../utils/orderStorage";
import {
  createOrderViaSupabase,
  isConfigured,
} from "../utils/orderStorageSupabase";
import {
  calculateCouponDiscount,
  getActiveCouponByCode,
  getClinicSettings,
} from "../utils/adminManagementStorage";
import { pushNotification } from "../utils/notificationStore";
import { supabase } from "../supabaseClient";

import clinicQrImage from "../assets/clinic-upi-qr.png";

export const CLINIC_UPI_ID = "9148663873@axl";
export const CLINIC_ACCOUNT_HOLDER = "MOZIM KHAJAKABIR MALIK";

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

// --------------------------------------------------
// PAYMENT SECURITY HELPERS
// --------------------------------------------------

const ORDER_COOLDOWN_KEY = "maliks_last_order_at";
const ORDER_COOLDOWN_MS = 30 * 1000; // min gap between orders from same browser

// Strip whitespace / control characters and normalize case for comparison.
const sanitizeTransactionId = (value) =>
  String(value ?? "")
    .replace(/\s+/g, "")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .toUpperCase();

// UPI transaction / UTR references are short alphanumeric codes.
const isPlausibleTransactionId = (value) => {
  const cleaned = sanitizeTransactionId(value);
  if (cleaned.length < 6 || cleaned.length > 35) return false;
  if (!/^[A-Z0-9]+$/.test(cleaned)) return false;
  // Reject repeated-character placeholders such as "000000" or "AAAAAA".
  if (/^(.)\1+$/.test(cleaned)) return false;
  return true;
};

// Block reuse of a transaction ID already used by a live (non-cancelled) order.
const isTransactionIdReused = async (cleanedId) => {
  if (!cleanedId) return false;
  // Check localStorage first
  try {
    const localReused = getOrders().some(
      (order) =>
        order?.cancellation?.cancelled !== true &&
        sanitizeTransactionId(order.payment?.transactionId) === cleanedId,
    );
    if (localReused) return true;
  } catch {
    // ignore
  }
  // Check Supabase when configured
  if (isConfigured()) {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, cancellation, payment(method, transaction_id)")
        .neq("order_status", "CANCELLED");
      if (!error && orders) {
        return orders.some(
          (order) => sanitizeTransactionId(order.payment?.transaction_id) === cleanedId,
        );
      }
    } catch {
      console.error("create-order: transaction ID reuse check failed via Supabase");
    }
  }
  return false;
};

const Checkout = ({ onOrderPlaced, onClose, onViewOrders }) => {
  const {
    checkoutOpen,
    closeCheckout,
    clear,
    items,
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

  // Payment security state
  const [paymentErrors, setPaymentErrors] = useState({});
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --------------------------------------------------
  // ORDER STATUS
  // --------------------------------------------------

  const [orderPlaced, setOrderPlaced] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [pendingTotals, setPendingTotals] = useState(null);

  // --------------------------------------------------
  // UPI ID
  // --------------------------------------------------
  // Replace this later with the clinic's real UPI ID.
  // --------------------------------------------------
  // DELIVERY
  // --------------------------------------------------

  const itemSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const discount = calculateCouponDiscount(itemSubtotal, appliedCoupon);
  const {
    subtotal: calculatedSubtotal,
    shipping,
    tax,
    discount: orderDiscount,
    total: totalAmount,
  } = calculateOrderTotals(items, { shipping: shippingFee, discount });
  // When the server recomputes a different total, show its authoritative breakdown
  // instead of the locally computed figures so the customer confirms the real amount.
  const displayTotals = pendingTotals ?? {
    subtotal: calculatedSubtotal,
    shipping,
    tax,
    discount: orderDiscount,
    total: totalAmount,
  };
  const displaySubtotal = displayTotals.subtotal;
  const displayShipping = displayTotals.shipping;
  const displayTax = displayTotals.tax;
  const displayOrderDiscount = displayTotals.discount;
  const displayTotal = displayTotals.total;
  const isFreeDelivery = displayShipping === 0;

  // --------------------------------------------------
  // RESET WHEN CHECKOUT OPENS
  // --------------------------------------------------

  useEffect(() => {
    // Reads the shipping fee from Supabase when configured (the same
    // server-side source of truth the Edge Function uses), so shipping is
    // consistent across all browsers. localStorage is per-browser and would
    // show different values in Chrome vs Edge. Falls back to localStorage
    // when Supabase is not configured or the query fails.
    const readShippingFee = async () => {
      if (isConfigured()) {
        try {
          const { data, error } = await supabase
            .from("clinic_settings")
            .select("order_shipping_fee")
            .limit(1)
            .maybeSingle();
          if (!error && data) {
            const fee = Number(data?.order_shipping_fee);
            setShippingFee(Number.isFinite(fee) && fee >= 0 ? fee : 0);
            return;
          }
        } catch {
          // fall through to localStorage fallback below
        }
      }
      try {
        setShippingFee(Number(getClinicSettings().orderShippingFee) || 0);
      } catch {
        setShippingFee(0);
      }
    };
    readShippingFee();
    const onStorage = (event) => {
      if (event.key === null || event.key === "maliks_clinic_settings")
        readShippingFee();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("maliks-settings-updated", readShippingFee);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("maliks-settings-updated", readShippingFee);
    };
  }, []);

  useEffect(() => {
    if (!checkoutOpen) return;

    setCurrentStep(1);
    setErrors({});
    setOrderPlaced(false);
    setOrderNumber("");
    setOrderError("");
    setPaymentConfirmed(false);
    setTransactionId("");
    setPaymentErrors({});
    setHoneypot("");
    setIsSubmitting(false);
    setCopied(false);
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponError("");
    setPendingTotals(null);

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

  const handleApplyCoupon = () => {
    setCouponError("");
    try {
      const coupon = getActiveCouponByCode(couponInput);
      if (!coupon) {
        setAppliedCoupon(null);
        setCouponError("Enter a valid, active coupon code.");
        pushNotification({
          audience: "user",
          type: "warning",
          title: "Coupon not applied",
          message: "Enter a valid, active coupon code and try again.",
        });
        return;
      }
      setAppliedCoupon(coupon);
      setCouponInput(coupon.code);
      pushNotification({
        audience: "user",
        type: "success",
        title: "Coupon applied",
        message: `${coupon.code} has been applied to your order.`,
      });
    } catch {
      setAppliedCoupon(null);
      setCouponError("Coupons could not be loaded from browser storage.");
      pushNotification({
        audience: "user",
        type: "warning",
        title: "Coupons unavailable",
        message: "Please try applying your coupon again.",
      });
    }
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
      pushNotification({
        audience: "user",
        type: "success",
        title: "UPI ID copied",
        message: "You can paste it in your UPI app to complete payment.",
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      setCopyError(
        "Copy is unavailable. Select the UPI ID to copy it manually.",
      );
      pushNotification({
        audience: "user",
        type: "warning",
        title: "Could not copy UPI ID",
        message: "Select the UPI ID and copy it manually.",
      });
    }
  };

  // --------------------------------------------------
  // PAYMENT VALIDATION (SECURITY)
  // --------------------------------------------------

  const validatePayment = () => {
    const newErrors = {};

    const cleanedId = sanitizeTransactionId(transactionId);
    if (!cleanedId) {
      newErrors.transactionId = "Transaction ID is required to continue.";
    } else if (!isPlausibleTransactionId(transactionId)) {
      newErrors.transactionId =
        "Enter a valid UPI transaction / UTR reference (6–35 letters or digits).";
    }

    if (!paymentConfirmed) {
      newErrors.confirm = "Please confirm that you have completed the payment.";
    }

    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // PAYMENT CONTINUE
  // --------------------------------------------------

  const handlePaymentContinue = async () => {
    if (paymentMethod !== "upi") {
      return;
    }

    // Honeypot: real users never fill this hidden field.
    if (honeypot.trim()) {
      return;
    }

    if (!validatePayment()) {
      return;
    }

    // Check transaction ID reuse asynchronously (Supabase + localStorage)
    const cleanedId = sanitizeTransactionId(transactionId);
    const reused = await isTransactionIdReused(cleanedId);
    if (reused) {
      setPaymentErrors({
        ...paymentErrors,
        transactionId:
          "This transaction ID has already been used for another order.",
      });
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

  const handlePlaceOrder = async (acceptedTotal = null) => {
    if (isSubmitting) return;

    if (!items?.length || !validateDelivery()) {
      return;
    }

    // Honeypot: silently drop bot submissions.
    if (honeypot.trim()) {
      return;
    }

    // Rate-limit repeated orders from the same browser.
    let lastOrderAt = 0;
    try {
      lastOrderAt = Number(window.localStorage.getItem(ORDER_COOLDOWN_KEY)) || 0;
    } catch {
      lastOrderAt = 0;
    }
    if (Date.now() - lastOrderAt < ORDER_COOLDOWN_MS) {
      const secondsLeft = Math.ceil(
        (ORDER_COOLDOWN_MS - (Date.now() - lastOrderAt)) / 1000,
      );
      setOrderError(
        `For security, please wait ${secondsLeft}s before placing another order.`,
      );
      setCurrentStep(2);
      return;
    }

    if (!validatePayment()) {
      setOrderError(
        "Please correct the payment details before placing your order.",
      );
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const orderData = {
      orderId: generateOrderId(),
      customerName: form.fullName.trim(),
      customerPhone: form.phone.trim(),
      customerEmail: form.email.trim() || null,
      deliveryAddress: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country,
      },
      notes: form.message.trim(),
      couponCode: appliedCoupon?.code || "",
      subtotal: calculatedSubtotal,
      shipping,
      tax,
      discount: orderDiscount,
      total: totalAmount,
      // When the customer confirms a server-recomputed total, echo it back so the
      // Edge Function can verify they accepted the authoritative amount.
      ...(Number.isFinite(acceptedTotal) ? { acceptedTotal } : {}),
      items: items.map(({ id, name, image, price, quantity }) => ({
        productId: id,
        name,
        image,
        price: Number(price) || 0,
        quantity: Number(quantity) || 1,
        subtotal: (Number(price) || 0) * (Number(quantity) || 1),
      })),
      payment: {
        method: "UPI",
        transactionId: sanitizeTransactionId(transactionId),
      },
    };

    try {
      let orderId;
      let orderAccessToken;
      if (isConfigured()) {
        // Save to Supabase via secure Edge Function (server-side price validation)
        const result = await createOrderViaSupabase(orderData);
        orderId = result.orderId;
        orderAccessToken = result.orderAccessToken;
      } else {
        // Fallback to localStorage
        const order = {
          id: orderData.orderId,
          createdAt: now,
          customer: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            email: orderData.customerEmail || "",
          },
          deliveryAddress: orderData.deliveryAddress,
          notes: orderData.notes,
          couponCode: orderData.couponCode,
          items: orderData.items,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          tax: orderData.tax,
          discount: orderData.discount,
          total: orderData.total,
          payment: {
            method: orderData.payment.method,
            transactionId: orderData.payment.transactionId,
            status: "Pending Verification",
          },
          orderStatus: "PENDING",
          cancellation: {
            cancelled: false,
            reason: "",
            cancelledAt: null,
          },
        };
        saveOrder(order);
        orderId = order.id;
      }

      try {
        window.localStorage.setItem(ORDER_COOLDOWN_KEY, String(Date.now()));
      } catch {
        // Cooldown persistence is best-effort; the order was still saved.
      }

      pushNotification({
        audience: "admin",
        type: "order",
        title: "New order received",
        message: `${orderData.customerName} placed order ${orderId} for ₹${Number(
          orderData.total,
        ).toLocaleString("en-IN")}.`,
        meta: { orderId },
      });
      pushNotification({
        audience: "user",
        type: "success",
        title: "Order placed successfully",
        message: `Your order ${orderId} is awaiting payment verification.`,
        meta: { orderId },
      });
      setOrderNumber(orderId);
      if (orderAccessToken) {
        try {
          window.localStorage.setItem("maliks_last_order_access_token", orderAccessToken);
        } catch {
          // localStorage best-effort; token is also in URL
        }
      }
      setOrderPlaced(true);
      clear();
      closeCheckout();
      onOrderPlaced?.({ orderId, orderAccessToken });
    } catch (err) {
      // If the server recomputed a different total, show the authoritative amount
      // and require explicit confirmation. The order is not created and the cart is
      // kept intact so the customer can review and confirm the real amount.
      if (err?.code === "TOTALS_CHANGED" && err?.totals) {
        setPendingTotals(err.totals);
        setOrderError("");
        return;
      }
      // Surface the actual error from the Edge Function (sanitized: no PII, no secrets)
      const message = err?.message || "We could not save your order. Please try again.";
      setOrderError(message);
      pushNotification({
        audience: "user",
        type: "warning",
        title: "Order not placed",
        message: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmChangedTotals = () => {
    if (!pendingTotals) return;
    const accepted = Number(pendingTotals.total);
    setPendingTotals(null);
    setOrderError("");
    handlePlaceOrder(accepted);
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
          <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>

          <p className="mt-2 text-sm text-stone-400">
            Add a product to your cart before proceeding to checkout.
          </p>

          <button
            type="button"
            onClick={() => {
              closeCheckout();
              onClose?.();
            }}
            className="mt-6 min-h-12 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
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
              <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                Order Number
              </p>

              <p className="mt-1 text-xl font-extrabold text-emerald-700">
                {orderNumber}
              </p>

              <div className="mt-4 border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400">Total</span>

                  <span className="font-bold text-white">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-stone-500">
              Your order details and payment information have been recorded. Our
              team will process your order.
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
      <div className="min-h-full bg-neutral-950 text-stone-100 [&_.bg-emerald-100]:bg-emerald-400/10 [&_.bg-stone-100]:bg-neutral-800 [&_.bg-stone-50]:bg-neutral-950 [&_.bg-white]:bg-neutral-900 [&_.border-stone-200]:border-white/10 [&_.border-stone-300]:border-white/15 [&_.text-emerald-700]:text-emerald-300 [&_.text-stone-500]:text-stone-400 [&_.text-stone-600]:text-stone-300 [&_.text-stone-700]:text-stone-200 [&_.text-stone-800]:text-stone-100 [&_.text-stone-900]:text-white [&_input]:bg-neutral-950 [&_input]:text-white [&_textarea]:bg-neutral-950 [&_textarea]:text-white">
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

                {currentStep === 1 ? "Back to Cart" : "Back"}
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
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                </div>

                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    currentStep >= 1 ? "text-stone-900" : "text-stone-500"
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
                  {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                </div>

                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    currentStep >= 2 ? "text-stone-900" : "text-stone-500"
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
                    currentStep >= 3 ? "text-stone-900" : "text-stone-500"
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

                  <form onSubmit={handleDeliverySubmit} className="space-y-6">
                    {/* Customer Details */}

                    <div>
                      <h2 className="mb-4 border-b border-stone-200 pb-3 text-sm font-bold tracking-wider text-stone-800 uppercase">
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
                              handleChange("fullName", e.target.value)
                            }
                            placeholder="Enter your full name"
                            className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                              handleChange("phone", e.target.value)
                            }
                            placeholder="+91 98765 43210"
                            className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                              handleChange("email", e.target.value)
                            }
                            placeholder="Enter your email address"
                            className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                      <h2 className="mb-4 border-b border-stone-200 pb-3 text-sm font-bold tracking-wider text-stone-800 uppercase">
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
                              handleChange("address", e.target.value)
                            }
                            placeholder="Enter your complete delivery address"
                            className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                                  e.target.value.replace(/\D/g, ""),
                                )
                              }
                              placeholder="Enter your pin code"
                              className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                                handleChange("city", e.target.value)
                              }
                              placeholder="Enter your city"
                              className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                                handleChange("state", e.target.value)
                              }
                              placeholder="Enter your state"
                              className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                              className="min-h-12 w-full rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm text-stone-600 outline-none"
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
                              handleChange("message", e.target.value)
                            }
                            placeholder="Any additional instructions for your order..."
                            className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                            Delivery details will be confirmed after order
                            placement.
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
                            <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                              UPI ID
                            </p>

                            <p className="mt-1 font-bold break-all text-stone-900">
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
                          <p
                            role="status"
                            className="mt-2 text-xs text-amber-700"
                          >
                            {copyError}
                          </p>
                        )}

                        <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                          <p className="text-sm font-semibold text-stone-800">
                            Pay ₹{totalAmount.toLocaleString("en-IN")} using any
                            UPI app.
                          </p>

                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            After completing the payment, enter your transaction
                            ID below and confirm the payment.
                          </p>
                        </div>

                        <div className="mt-4 grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[14rem_1fr] sm:items-center">
                          <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/60 p-3 shadow-xs">
                            <img
                              src={clinicQrImage}
                              alt="Scan PhonePe / GooglePay / Paytm QR Code to pay Malik's Polyclinic"
                              className="aspect-square w-48 max-w-full rounded-lg border border-stone-200 bg-white object-contain p-1 shadow-sm"
                            />
                            <p className="mt-2 text-[11px] font-bold text-stone-700">
                              Scan with any UPI App
                            </p>
                            <p className="text-[10px] text-stone-500">
                              PhonePe · GPay · Paytm · BHIM · SBI
                            </p>
                          </div>

                          <div className="space-y-3">
                            <ol className="list-inside list-decimal space-y-2 text-xs leading-5 text-stone-700">
                              <li>
                                Open any UPI app (PhonePe, Google Pay, Paytm,
                                etc.).
                              </li>
                              <li>
                                Scan the QR code or enter UPI ID{" "}
                                <strong className="font-mono text-emerald-800">
                                  {CLINIC_UPI_ID}
                                </strong>
                                .
                              </li>
                              <li>
                                Pay exact amount:{" "}
                                <strong className="text-emerald-800">
                                  ₹{totalAmount.toLocaleString("en-IN")}
                                </strong>
                                .
                              </li>
                              <li>
                                Copy the 12-digit UPI Reference / UTR /
                                Transaction ID.
                              </li>
                            </ol>

                            {/* Important Verification Notice */}
                            <div className="rounded-xl border-2 border-amber-400 bg-amber-500/15 p-4 shadow-md">
                              <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                                <div className="space-y-2">
                                  <p className="text-xs font-extrabold tracking-widest text-amber-300 uppercase">
                                    ⚠ Important: Verify Beneficiary Name
                                  </p>
                                  <p className="text-xs leading-relaxed text-stone-200">
                                    We are an independent small healthcare
                                    clinic & pharmacy. While paying, your UPI
                                    app will display the verified account holder
                                    name:
                                  </p>
                                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400 bg-neutral-900 px-3 py-1.5 font-mono text-sm font-black text-emerald-300 shadow">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span>{CLINIC_ACCOUNT_HOLDER}</span>
                                    <span className="font-sans text-[11px] font-normal text-stone-400">
                                      (State Bank of India)
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-amber-200">
                                    Please verify this name on your UPI screen
                                    before confirming the payment.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
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
                            inputMode="text"
                            autoComplete="off"
                            maxLength={35}
                            value={transactionId}
                            onChange={(e) => {
                              setTransactionId(e.target.value);
                              setPaymentErrors((previous) => ({
                                ...previous,
                                transactionId: "",
                              }));
                            }}
                            placeholder="Enter your UPI transaction / UTR number"
                            aria-invalid={
                              paymentErrors.transactionId ? "true" : undefined
                            }
                            aria-describedby="transaction-id-help"
                            className={`min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm transition outline-none focus:ring-2 ${
                              paymentErrors.transactionId
                                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                                : "border-stone-300 focus:border-emerald-600 focus:ring-emerald-100"
                            }`}
                          />

                          {paymentErrors.transactionId ? (
                            <p
                              id="transaction-id-help"
                              role="alert"
                              className="mt-1.5 text-xs font-medium text-rose-600"
                            >
                              {paymentErrors.transactionId}
                            </p>
                          ) : (
                            <p
                              id="transaction-id-help"
                              className="mt-1.5 text-xs text-stone-500"
                            >
                              Enter the 12-digit UPI reference / UTR / transaction
                              ID from your payment app. It is required to
                              continue.
                            </p>
                          )}
                        </div>

                        {/* Honeypot (hidden from real users, catches bots) */}

                        <div
                          aria-hidden="true"
                          className="absolute h-0 w-0 overflow-hidden opacity-0"
                        >
                          <label htmlFor="checkout-company">Company</label>
                          <input
                            id="checkout-company"
                            type="text"
                            name="company"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                          />
                        </div>

                        {/* Confirm Payment */}

                        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
                          <input
                            type="checkbox"
                            checked={paymentConfirmed}
                            onChange={(e) => {
                              setPaymentConfirmed(e.target.checked);
                              setPaymentErrors((previous) => ({
                                ...previous,
                                confirm: "",
                              }));
                            }}
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

                        {paymentErrors.confirm && (
                          <p
                            role="alert"
                            className="mt-1.5 text-xs font-medium text-rose-600"
                          >
                            {paymentErrors.confirm}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Continue */}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="min-h-12.5 rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handlePaymentContinue}
                      disabled={
                        paymentMethod === "upi" &&
                        (!paymentConfirmed || !transactionId.trim())
                      }
                      className={`min-h-12.5 rounded-xl px-7 py-3 text-sm font-bold text-white transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                        paymentMethod === "upi" &&
                        (!paymentConfirmed || !transactionId.trim())
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
                      <h2 className="text-sm font-bold tracking-wider text-stone-800 uppercase">
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

                      <p className="mt-2 text-sm leading-6 whitespace-pre-line text-stone-600">
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
                      <h2 className="text-sm font-bold tracking-wider text-stone-800 uppercase">
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
                            Transaction ID: {transactionId || "Not provided"}
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
                      <h2 className="text-sm font-bold tracking-wider text-stone-800 uppercase">
                        Order Items
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => {
                        const itemTotal =
                          Number(item.price) * Number(item.quantity);

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
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Place Order */}

                  {orderError && (
                    <p
                      role="alert"
                      className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                    >
                      {orderError}
                    </p>
                  )}

                  {pendingTotals && (
                    <div
                      role="alert"
                      className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4"
                    >
                      <p className="text-sm font-bold text-amber-800">
                        The order total has changed
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        We refreshed your order and the total is now{" "}
                        <span className="font-bold">
                          ₹{Number(displayTotal).toLocaleString("en-IN")}
                        </span>{" "}
                        (subtotal ₹
                        {Number(displaySubtotal).toLocaleString("en-IN")}, shipping{" "}
                        {isFreeDelivery
                          ? "FREE"
                          : `₹${Number(displayShipping).toLocaleString("en-IN")}`}
                        , tax ₹{Number(displayTax).toLocaleString("en-IN")}). Please
                        confirm the updated amount to place your order.
                      </p>
                      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setPendingTotals(null)}
                          className="min-h-10 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmChangedTotals}
                          disabled={isSubmitting}
                          className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none disabled:opacity-60"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {isSubmitting
                            ? "Placing Order…"
                            : `Confirm ₹${Number(displayTotal).toLocaleString(
                                "en-IN",
                              )} & Place Order`}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="min-h-[52px] rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    >
                      Back
                    </button>

                    {/* When pendingTotals is set, the main Place Order button is hidden so the customer
                        must explicitly confirm the server-recomputed total via the amber banner button.
                        Clicking the main button without acceptedTotal would trigger TOTALS_CHANGED again,
                        creating an infinite loop. */}
                    {!pendingTotals && (
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none ${
                          isSubmitting
                            ? "cursor-not-allowed bg-stone-300"
                            : "bg-emerald-700 hover:bg-emerald-800"
                        }`}
                      >
                        <Lock className="h-4 w-4" />
                        {isSubmitting
                          ? "Placing Order…"
                          : "Confirm Payment & Place Order"}
                      </button>
                    )}
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
                        Number(item.price) * Number(item.quantity);

                      return (
                        <div key={item.id} className="flex gap-3">
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
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}

                  <div className="my-5 border-t border-stone-200" />

                  {/* Subtotal */}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>

                    <span className="font-semibold text-stone-900">
                      ₹{Number(displaySubtotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="checkout-coupon"
                      className="mb-1.5 block text-xs font-semibold text-stone-600"
                    >
                      Coupon code
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="checkout-coupon"
                        type="text"
                        value={couponInput}
                        onChange={(event) => {
                          setCouponInput(event.target.value);
                          setCouponError("");
                        }}
                        placeholder="Enter code"
                        autoCapitalize="characters"
                        className="min-h-10 min-w-0 flex-1 rounded-xl border border-stone-300 px-3 text-sm text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="min-h-10 shrink-0 rounded-xl border border-emerald-700 bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="mt-2 text-xs font-medium text-emerald-700">
                        {appliedCoupon.code} applied
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponInput("");
                            setCouponError("");
                          }}
                          className="ml-2 underline"
                        >
                          Remove
                        </button>
                      </p>
                    )}
                    {couponError && (
                      <p className="mt-2 text-xs text-rose-600">
                        {couponError}
                      </p>
                    )}
                  </div>

                  {displayOrderDiscount > 0 && (
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-stone-600">Discount</span>
                      <span className="font-semibold text-emerald-700">
                        −₹{Number(displayOrderDiscount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {/* Tax */}

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-stone-600">Tax</span>

                    <span className="font-semibold text-stone-900">
                      ₹{Number(displayTax).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Shipping */}

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-stone-600">Shipping</span>

                    <span
                      className={`font-bold ${isFreeDelivery ? "text-emerald-600" : "text-stone-900"}`}
                    >
                      {isFreeDelivery
                        ? "FREE"
                        : `₹${Number(displayShipping).toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  {/* Free Delivery Message */}

                  <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-start gap-2">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-xs leading-5 font-semibold text-stone-600">
                        {isFreeDelivery
                          ? "Your order is eligible for FREE delivery."
                          : "Standard shipping is included in your order total."}
                      </p>
                    </div>
                  </div>

                  {/* Total */}

                  <div className="mt-5 border-t border-stone-200 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">Total</span>

                      <span className="text-xl font-extrabold text-stone-900">
                        ₹{displayTotal.toLocaleString("en-IN")}
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
