import React from 'react';
import { Leaf, Mail, Phone, MapPin, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', href: '#home' },
        { name: 'What We Treat', href: '#treatments' },
        { name: 'Meet Our Doctors', href: '#doctors' },
        { name: 'Contact', href: '#contact' },
    ];

    const treatments = [
        { name: 'Digestive & IBS Care', href: '#treatments' },
        { name: 'Skin & Hair Therapies', href: '#treatments' },
        { name: 'Joint & Muscle Relief', href: '#treatments' },
        { name: 'PCOD / PCOS Management', href: '#treatments' },
        { name: 'Respiratory & Sinus', href: '#treatments' },
    ];

    return (
        <footer className="bg-stone-900 text-stone-300 pt-12 sm:pt-16 pb-8 sm:pb-12 border-t border-stone-800 relative overflow-hidden w-full max-w-full">
            {/* Decorative Background Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Main Footer Layout - Mobile: Vertical Stack (grid-cols-1), Desktop: Multi-column (lg:grid-cols-12) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-stone-800 text-left">

                    {/* Brand Info */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                                <Leaf className="w-5 h-5 text-emerald-100 fill-emerald-100/20" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Malik's <span className="text-emerald-500">Polyclinic</span>
                            </span>
                        </div>

                        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                            Providing compassionate, personalized Homeopathic and Ayurvedic healthcare. Led by Dr. Mozim Malik (BHMS, CCH) and Dr. Karishma Malik (BAMS, YIC).
                        </p>

                        <div className="pt-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 text-xs font-medium max-w-full">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="truncate">BHMS & BAMS Certified Doctors</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                        <h3 className="text-white text-sm sm:text-base font-semibold tracking-wide uppercase sm:normal-case">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 sm:space-y-2.5 text-xs sm:text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 items-center text-stone-300"
                                    >
                                        <span>{link.name}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Key Treatments */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                        <h3 className="text-white text-sm sm:text-base font-semibold tracking-wide uppercase sm:normal-case">
                            Specialties
                        </h3>
                        <ul className="space-y-3 sm:space-y-2.5 text-xs sm:text-sm">
                            {treatments.map((t) => (
                                <li key={t.name}>
                                    <a href={t.href} className="hover:text-emerald-400 transition-colors duration-200 block py-1 text-stone-300">
                                        {t.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                        <h3 className="text-white text-sm sm:text-base font-semibold tracking-wide uppercase sm:normal-case">
                            Contact Information
                        </h3>
                        <ul className="space-y-3 text-xs sm:text-sm">
                            <li className="flex items-start gap-3 text-stone-400">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Malik's Polyclinic, Natural Healthcare Hub</span>
                            </li>
                            <li className="flex items-center gap-3 text-stone-400">
                                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                <a href="#contact" className="hover:text-emerald-400 transition-colors py-1">
                                    Contact Clinic Doctor
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-stone-400">
                                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                                <a href="mailto:info@malikspolyclinic.com" className="hover:text-emerald-400 transition-colors py-1 truncate">
                                    info@malikspolyclinic.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-stone-400 pt-1">
                                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-left">
                    <p>© {currentYear} Malik's Polyclinic. All rights reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <a href="#" className="hover:text-stone-300 transition-colors py-1">Privacy Policy</a>
                        <a href="#" className="hover:text-stone-300 transition-colors py-1">Terms of Service</a>
                        <a href="#" className="hover:text-stone-300 transition-colors py-1">Medical Disclaimer</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
