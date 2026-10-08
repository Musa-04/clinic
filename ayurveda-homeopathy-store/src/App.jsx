import React, { useEffect, useState } from "react";
import { Stethoscope, CheckCircle } from "lucide-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatWeTreat from "./components/WhatWeTreat";
import Doctors from "./components/Doctors";
import About from "./components/About";
import Products from "./components/Products";
import WhyChooseUs from "./components/WhyChooseUs";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";
import CartDrawer from "./components/CartDrawer";
import Checkout from "./components/Checkout";
import ProductDetails from "./pages/ProductDetails";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./admin/AdminOrders";
import AdminAuthGuard from "./admin/AdminAuthGuard";
import { useCart } from "./context/CartContext";
import { products } from "./data/products";
import { getProducts } from "./utils/productStorage";
import { getProductCategories } from "./utils/adminManagementStorage";
import { saveAppointment } from "./utils/appointmentStorage";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const [productCategories, setProductCategories] = useState(["Ayurvedic", "Homeopathic"]);
  const [catalogError, setCatalogError] = useState("");
  const { openCheckout, closeCheckout } = useCart();

  useEffect(() => {
    const refreshCatalog = () => {
      try {
        setCatalogProducts(getProducts());
        setProductCategories(getProductCategories());
        setCatalogError("");
      } catch {
        setCatalogProducts([]);
        setCatalogError("The product catalog could not be loaded from browser storage.");
      }
    };
    refreshCatalog();
    const handleStorage = (event) => {
      if (event.key === null || event.key === "maliks_products" || event.key === "maliks_product_categories") refreshCatalog();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("maliks-products-updated", refreshCatalog);
    window.addEventListener("maliks-categories-updated", refreshCatalog);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("maliks-products-updated", refreshCatalog);
      window.removeEventListener("maliks-categories-updated", refreshCatalog);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isCheckoutRoute = currentPath === "/checkout";
  useEffect(() => {
    if (isCheckoutRoute) openCheckout();
    else closeCheckout();
  }, [isCheckoutRoute, openCheckout, closeCheckout]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(window.location.pathname);

    const hash = window.location.hash.slice(1);
    window.requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const productRoute = currentPath.match(/^\/products\/([^/]+)\/?$/);
  const productId = productRoute ? decodeURIComponent(productRoute[1]) : null;
  const selectedProduct = productId
    ? catalogProducts.find((product) => String(product.id) === productId)
    : null;
  const isProductRoute = currentPath.startsWith("/products/");
  const ordersRoute = currentPath.match(/^\/orders\/([^/]+)\/?$/);
  const successRoute = currentPath.match(/^\/order-success\/([^/]+)\/?$/);
  const orderId = ordersRoute
    ? decodeURIComponent(ordersRoute[1])
    : successRoute
      ? decodeURIComponent(successRoute[1])
      : null;
  const isOrdersRoute = currentPath === "/orders" || currentPath === "/orders/";
  const adminRoute = currentPath.match(/^\/admin(?:\/(dashboard|orders|products|categories|customers|analytics|reviews|coupons|settings))?\/?$/);
  const adminSection = adminRoute?.[1] || "orders";
  const isAdminRoute = Boolean(adminRoute);

  const openProduct = (product) => navigate(`/products/${product.id}`);

  // Appointment form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [doctor, setDoctor] = useState("");
  const [concern, setConcern] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [messageText, setMessageText] = useState("");

  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setValidationError("");
    setSuccessMessage("");

    // Required field validation
    if (!fullName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setValidationError("Please enter your phone number.");
      return;
    }

    if (!doctor) {
      setValidationError("Please select a doctor.");
      return;
    }

    if (!concern) {
      setValidationError("Please select your concern.");
      return;
    }

    if (!preferredDate) {
      setValidationError("Please pick a preferred date.");
      return;
    }

    try {
      saveAppointment({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        doctor: e.currentTarget.elements.doctor.selectedOptions[0]?.textContent || doctor,
        concern: e.currentTarget.elements.concern.selectedOptions[0]?.textContent || concern,
        preferredDate,
        message: messageText.trim(),
      });
    } catch {
      setValidationError("Your appointment request could not be saved. Please check browser storage and try again.");
      return;
    }

    setSuccessMessage(
      "Your appointment request has been submitted successfully. Our clinic team will contact you soon."
    );

    // Clear form
    setFullName("");
    setPhone("");
    setEmail("");
    setDoctor("");
    setConcern("");
    setPreferredDate("");
    setMessageText("");
  };

  if (isAdminRoute) {
    return (
      <AdminAuthGuard>
        <AdminOrders onNavigate={navigate} section={adminSection} />
      </AdminAuthGuard>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-50 font-sans text-stone-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navbar */}
      <Navbar />

      {ordersRoute ? (
        <OrderDetails orderId={orderId} onNavigate={navigate} />
      ) : successRoute ? (
        <OrderSuccess orderId={orderId} onNavigate={navigate} />
      ) : isOrdersRoute ? (
        <Orders onNavigate={navigate} />
      ) : isProductRoute ? (
        <ProductDetails
          product={selectedProduct}
          products={catalogProducts}
          onBack={() => navigate("/#medicines")}
          onNavigate={navigate}
          onNavigateToProduct={(product) => openProduct(product)}
        />
      ) : (
      <main className="w-full max-w-full flex-grow">
        {/* Hero */}
        <Hero />

        {/* Doctors */}
        <Doctors />

        {/* About */}
        <About />

        {/* Treatments & Wellness Services */}
        <WhatWeTreat />

        {/* Products */}
        <Products products={catalogProducts} productCategories={productCategories} catalogError={catalogError} onViewProduct={openProduct} />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* How It Works */}
        <HowItWorks />

        {/* Testimonials */}
        <Testimonials />

        {/* Appointment */}
        <section
          id="contact"
          className="w-full bg-gradient-to-b from-stone-100 to-emerald-950 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left Content */}
              <div className="flex flex-col justify-center lg:col-span-5">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-800/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  <Stethoscope className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Appointment</span>
                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  Book an Appointment
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-100/80 sm:text-base">
                  Schedule a consultation with our Homeopathic or Ayurvedic
                  doctor. Share your details and health concern, and our clinic
                  team can assist you with the next steps.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800/60">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Personalized Consultation
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                        Discuss your health concerns with our qualified
                        practitioners.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800/60">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Natural Healthcare
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                        Explore Homeopathic and Ayurvedic approaches based on
                        your individual needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800/60">
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Easy Appointment Request
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                        Submit your details and our clinic team will get in
                        touch with you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Form */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-stone-900 sm:text-2xl">
                      Appointment Details
                    </h3>

                    <p className="mt-1 text-sm text-stone-500">
                      Please fill in your details below.
                    </p>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                      <p className="text-sm font-medium text-rose-600">
                        {validationError}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <p className="text-sm font-medium leading-6 text-emerald-700">
                        {successMessage}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Phone */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="mb-1.5 block text-sm font-semibold text-stone-700"
                        >
                          Full Name
                        </label>

                        <input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-1.5 block text-sm font-semibold text-stone-700"
                        >
                          Phone Number
                        </label>

                        <input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-semibold text-stone-700"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    {/* Doctor + Concern */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Doctor */}
                      <div>
                        <label
                          htmlFor="doctor"
                          className="mb-1.5 block text-sm font-semibold text-stone-700"
                        >
                          Select Doctor
                        </label>

                        <select
                          id="doctor"
                          name="doctor"
                          value={doctor}
                          onChange={(e) => setDoctor(e.target.value)}
                          className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="" disabled>
                            Select a doctor
                          </option>

                          <option value="mozim">
                            Dr. Mozim Malik - BHMS, CCH
                          </option>

                          <option value="karishma">
                            Dr. Karishma Malik - BAMS, YIC
                          </option>
                        </select>
                      </div>

                      {/* Concern */}
                      <div>
                        <label
                          htmlFor="concern"
                          className="mb-1.5 block text-sm font-semibold text-stone-700"
                        >
                          Select Concern
                        </label>

                        <select
                          id="concern"
                          name="concern"
                          value={concern}
                          onChange={(e) => setConcern(e.target.value)}
                          className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        >
                          <option value="" disabled>
                            Select your concern
                          </option>

                          <option value="digestive">
                            Digestive Disorders
                          </option>

                          <option value="skin-hair">
                            Skin & Hair Disorders
                          </option>

                          <option value="joint-muscle">
                            Joint & Muscle Disorders
                          </option>

                          <option value="respiratory">
                            Respiratory Disorders
                          </option>

                          <option value="stress-anxiety">
                            Stress & Anxiety
                          </option>

                          <option value="womens-health">
                            Women's Health
                          </option>

                          <option value="urinary-kidney">
                            Urinary & Kidney Health
                          </option>

                          <option value="pcod-pcos">PCOD / PCOS</option>

                          <option value="weight-management">
                            Weight Management
                          </option>

                          <option value="general-wellness">
                            General Wellness
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Date */}
                    <div>
                      <label
                        htmlFor="preferredDate"
                        className="mb-1.5 block text-sm font-semibold text-stone-700"
                      >
                        Preferred Date
                      </label>

                      <input
                        id="preferredDate"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1.5 block text-sm font-semibold text-stone-700"
                      >
                        Message
                      </label>

                      <textarea
                        id="message"
                        rows="4"
                        placeholder="Tell us briefly about your concern..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-800 active:bg-emerald-900"
                    >
                      <Stethoscope className="h-4 w-4 shrink-0" />
                      <span>Submit Appointment Request</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Cart Drawer */}
      <CartDrawer onCheckout={() => navigate("/checkout")} />

      {/* Checkout */}
      <Checkout
        onOrderPlaced={(order) => navigate(`/order-success/${encodeURIComponent(order.id)}`)}
        onClose={() => navigate("/#medicines")}
        onViewOrders={() => navigate("/orders")}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;