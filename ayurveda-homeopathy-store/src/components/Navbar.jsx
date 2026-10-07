import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, Stethoscope } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('Home');
    const cart = useCart();
    const cartCount = cart?.totalQuantity || 0;
    const openCart = cart?.open;

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'About', href: '#about' },
        { name: 'Medicines', href: '#medicines' },
        { name: 'What We Treat', href: '#treatments' },
        { name: 'Doctors', href: '#doctors' },
        { name: 'Contact', href: '#contact' },
    ];

    // Close mobile menu on esc key or resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent background body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const handleNavClick = (linkName) => {
        setActiveLink(linkName);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 glass-header border-b border-emerald-900/10 shadow-xs transition-all duration-300 w-full max-w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">

                    {/* Brand Logo & Name */}
                    <a
                        href="#home"
                        onClick={() => handleNavClick('Home')}
                        className="flex items-center gap-2 sm:gap-2.5 group shrink-0 focus:outline-none"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-300">
                            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 fill-emerald-100/20" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                                Malik's <span className="text-emerald-600">Polyclinic</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-600/90 font-semibold mt-0.5">
                                Homeopathy & Ayurveda
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-stone-100/90 p-1.5 rounded-full border border-stone-200/80 shadow-inner">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => handleNavClick(link.name)}
                                className={`px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${activeLink === link.name
                                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                                    : 'text-stone-600 hover:text-emerald-700 hover:bg-stone-200/50'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop Action - Contact Doctor Button */}
                    <div className="hidden md:flex items-center gap-3">
                        <button aria-label="Open cart" onClick={() => openCart?.()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs lg:text-sm font-semibold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all duration-200">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span>Cart</span>
                            {cartCount > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{cartCount}</span>}
                        </button>
                        <a
                            href="#contact"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs lg:text-sm font-semibold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <Stethoscope className="w-4 h-4 text-emerald-200" />
                            <span>Contact Doctor</span>
                        </a>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-3 rounded-xl text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                            aria-label="Toggle navigation menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-emerald-800" />
                            ) : (
                                <Menu className="w-6 h-6 text-stone-800" />
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Backdrop Overlay & Drawer Panel */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[64px] z-40 flex flex-col">

                    {/* Semi-transparent Backdrop Click Area */}
                    <div
                        className="fixed inset-0 top-[64px] bg-stone-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sliding Menu Drawer */}
                    <div className="relative bg-white border-b border-emerald-100 shadow-2xl px-4 pt-4 pb-6 space-y-3 z-50 animate-in slide-in-from-top-4 duration-200 text-left max-h-[calc(100vh-64px)] overflow-y-auto">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => handleNavClick(link.name)}
                                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all min-h-[44px] ${activeLink === link.name
                                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                                        : 'text-stone-700 hover:bg-stone-50 hover:text-emerald-700'
                                        }`}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-stone-100">
                            <a
                                href="#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-md shadow-emerald-800/20 min-h-[48px]"
                            >
                                <Stethoscope className="w-5 h-5 text-emerald-200" />
                                <span>Contact Doctor</span>
                            </a>
                        </div>
                    </div>

                </div>
            )}
        </header>
    );
};

export default Navbar;
