import React from "react";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleSectionClick = (event, hash) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate(`/#${hash}`);
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = (event) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAdminClick = (event) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate("/admin/login");
    } else {
      window.location.assign("/admin/login");
    }
  };

  const handlePolicyClick = (event) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate("/privacy-policy");
    } else {
      window.location.assign("/privacy-policy");
    }
  };

  const quickLinks = [
    { name: "Home", hash: "home", onClick: handleHomeClick },
    { name: "What We Treat", hash: "treatments" },
    { name: "Meet Our Doctors", hash: "doctors" },
    { name: "Contact", hash: "contact" },
  ];

  const treatments = [
    { name: "Digestive & IBS Care", hash: "treatments" },
    { name: "Skin & Hair Therapies", hash: "treatments" },
    { name: "Joint & Muscle Relief", hash: "treatments" },
    { name: "PCOD / PCOS Management", hash: "treatments" },
    { name: "Respiratory & Sinus", hash: "treatments" },
  ];

  return (
    <footer className="relative w-full max-w-full overflow-hidden border-t border-stone-800 bg-stone-900 pt-12 pb-8 text-stone-300 sm:pt-16 sm:pb-12">
      {/* Decorative Background Accent */}
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-900/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Layout - Mobile: Vertical Stack (grid-cols-1), Desktop: Multi-column (lg:grid-cols-12) */}
        <div className="grid grid-cols-1 gap-8 border-b border-stone-800 pb-10 text-left sm:gap-10 sm:pb-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Info */}
          <div className="space-y-4 sm:space-y-5 lg:col-span-4">
            <a
              href="/"
              onClick={handleHomeClick}
              aria-label="Malik's Polyclinic home"
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                <Leaf className="h-5 w-5 fill-emerald-100/20 text-emerald-100" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-emerald-100 sm:text-2xl">
                Malik's <span className="text-emerald-500">Polyclinic</span>
              </span>
            </a>

            <p className="max-w-sm text-xs leading-relaxed text-stone-400 sm:text-sm">
              Providing compassionate, personalized Homeopathic and Ayurvedic
              healthcare. Led by Dr. Mozim Malik (BHMS, CCH) and Dr. Karishma
              Malik (BAMS, YIC).
            </p>

            <div className="pt-1">
              <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-800/50 bg-emerald-950/80 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate">BHMS & BAMS Certified Doctors</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase sm:text-base sm:normal-case">
              Quick Links
            </h3>
            <ul className="space-y-3 text-xs sm:space-y-2.5 sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.onClick ? "/" : `#${link.hash}`}
                    onClick={(event) =>
                      link.onClick
                        ? link.onClick(event)
                        : handleSectionClick(event, link.hash)
                    }
                    className="inline-flex min-h-9 items-center gap-1 text-stone-300 transition-colors duration-200 hover:text-emerald-400 sm:min-h-0"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Treatments */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase sm:text-base sm:normal-case">
              Specialties
            </h3>
            <ul className="space-y-3 text-xs sm:space-y-2.5 sm:text-sm">
              {treatments.map((t) => (
                <li key={t.name}>
                  <a
                    href={`#${t.hash}`}
                    onClick={(event) => handleSectionClick(event, t.hash)}
                    className="block py-1 text-stone-300 transition-colors duration-200 hover:text-emerald-400"
                  >
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-wide text-white uppercase sm:text-base sm:normal-case">
              Contact Information
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-3 text-stone-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
                <span>Somwar Peth, Chikodi - 591201</span>
              </li>
              <li className="flex items-center gap-3 text-stone-400">
                <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                <a
                  href="#contact"
                  onClick={(event) => handleSectionClick(event, "contact")}
                  className="py-1 transition-colors hover:text-emerald-400"
                >
                  Contact Clinic Doctor
                </a>
              </li>
              <li className="flex items-center gap-3 text-stone-400">
                <Mail className="h-4 w-4 shrink-0 text-emerald-500" />
                <a
                  href="mailto:mozammalik333@gmail.com"
                  className="truncate py-1 transition-colors hover:text-emerald-400"
                >
                  mozammalik333@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1 text-stone-400">
                <Clock className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center text-xs text-stone-500 sm:pt-8 md:flex-row md:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p>© {currentYear} Malik's Polyclinic. All rights reserved.</p>
            <span className="hidden text-stone-700 sm:inline">•</span>
            <p className="font-medium text-stone-400">
              Designed & Developed with{" "}
              <span className="animate-pulse text-rose-500">♥</span> by{" "}
              <strong className="font-bold tracking-wide text-white">
                Musa
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a
              href="/admin/login"
              onClick={handleAdminClick}
              className="inline-flex items-center gap-1 py-1 font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Portal</span>
            </a>
            <a
              href="/privacy-policy"
              onClick={handlePolicyClick}
              className="py-1 transition-colors hover:text-stone-300"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
