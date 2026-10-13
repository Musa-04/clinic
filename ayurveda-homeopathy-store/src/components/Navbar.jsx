import React, { useState, useEffect } from "react";
import {
  Leaf,
  Menu,
  ShoppingCart,
  X,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const cart = useCart();
  const cartCount = cart?.totalQuantity || 0;
  const openCart = cart?.open;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/#about" },
    { name: "Medicines", path: "/#medicines" },
    { name: "Treatments", path: "/#treatments" },
    { name: "Doctors", path: "/#doctors" },
    { name: "Contact", path: "/#contact" },
  ];
  const contactLink = navLinks[navLinks.length - 1];

  // Close the compact navigation on escape or when the desktop layout takes over.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNavClick = (event, link) => {
    event.preventDefault();
    setActiveLink(link.name);
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(link.path);
      return;
    }
    // Fallback: scroll within the current document when no router is provided.
    if (link.path === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document
        .getElementById(link.path.replace("/#", ""))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAdminClick = (event) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate("/admin/login");
    } else {
      window.location.assign("/admin/login");
    }
  };

  return (
    <header className="glass-header sticky top-0 z-50 w-full max-w-full border-b border-emerald-900/10 shadow-xs transition-all duration-300">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Brand Logo & Name */}
          <a
            href="/"
            onClick={(event) => handleNavClick(event, navLinks[0])}
            className="group flex shrink-0 items-center gap-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
              <Leaf className="h-4 w-4 fill-emerald-100/20 text-emerald-100 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base leading-none font-bold tracking-tight text-emerald-950 transition-colors group-hover:text-emerald-700 sm:text-xl">
                Malik's <span className="text-emerald-600">Polyclinic</span>
              </span>
              <span className="mt-0.5 text-[8px] font-semibold tracking-wider text-emerald-600/90 uppercase sm:text-[10px]">
                Homeopathy & Ayurveda
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-stone-200/80 bg-stone-100/90 p-1.5 shadow-inner lg:gap-2 xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(event) => handleNavClick(event, link)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 lg:px-5 lg:text-sm ${
                  activeLink === link.name
                    ? "bg-white font-semibold text-emerald-800 shadow-xs"
                    : "text-stone-600 hover:bg-stone-200/50 hover:text-emerald-700"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden items-center gap-2.5 xl:flex">
            <NotificationBell variant="light" />
            <a
              href="/admin/login"
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-stone-700 transition-all duration-200 hover:bg-stone-200/60 hover:text-emerald-800 lg:text-sm"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Admin</span>
            </a>

            <button
              aria-label="Open cart"
              onClick={() => openCart?.()}
              className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 transition-all duration-200 hover:bg-emerald-800 hover:shadow-lg lg:text-sm"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M6 6h15l-1.5 9h-12z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {cartCount}
                </span>
              )}
            </button>
            <a
              href={contactLink.path}
              onClick={(event) => handleNavClick(event, contactLink)}
              className="flex transform items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-800/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg lg:text-sm"
            >
              <Stethoscope className="h-4 w-4 text-emerald-200" />
              <span>Contact Doctor</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-1 xl:hidden">
            <NotificationBell variant="light" />
            <button
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              onClick={() => openCart?.()}
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-emerald-800" />
              ) : (
                <Menu className="h-6 w-6 text-stone-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!isMobileMenuOpen}
        className={`overflow-hidden border-b border-emerald-100 bg-white shadow-lg transition-[max-height,opacity] duration-300 ease-in-out xl:hidden ${isMobileMenuOpen ? "max-h-[calc(100dvh-4rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
      >
        <nav
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 pt-3 pb-5 text-left sm:px-6"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(event) => handleNavClick(event, link)}
                tabIndex={isMobileMenuOpen ? 0 : -1}
                className={`flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none ${
                  activeLink === link.name
                    ? "border-l-4 border-emerald-600 bg-emerald-50 font-bold text-emerald-800"
                    : "text-stone-700 hover:bg-stone-50 hover:text-emerald-700"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
            <a
              href="/admin/login"
              onClick={handleAdminClick}
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50/60 px-6 py-3 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Admin Portal Access</span>
            </a>

            <a
              href={contactLink.path}
              onClick={(event) => handleNavClick(event, contactLink)}
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-800/20 transition-colors hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Stethoscope className="h-5 w-5 text-emerald-200" />
              <span>Contact Doctor</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
