import React, { useState, useEffect } from 'react';
import { Leaf, Menu, ShoppingCart, X, Stethoscope } from 'lucide-react';
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
        { name: 'Treatments', href: '#treatments' },
        { name: 'Doctors', href: '#doctors' },
        { name: 'Contact', href: '#contact' },
    ];

    // Close the compact navigation on escape or when the desktop layout takes over.
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setIsMobileMenuOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleNavClick = (linkName) => {
        setActiveLink(linkName);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 glass-header border-b border-emerald-900/10 shadow-xs transition-all duration-300 w-full max-w-full">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">

                    {/* Brand Logo & Name */}
                    <a
                        href="#home"
                        onClick={() => handleNavClick('Home')}
                        className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-lg"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-300">
                            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 fill-emerald-100/20" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-base sm:text-xl font-bold text-emerald-950 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                                Malik's <span className="text-emerald-600">Polyclinic</span>
                            </span>
                            <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-emerald-600/90 font-semibold mt-0.5">
                                Homeopathy & Ayurveda
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden xl:flex items-center gap-1 lg:gap-2 bg-stone-100/90 p-1.5 rounded-full border border-stone-200/80 shadow-inner">
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
                    <div className="hidden xl:flex items-center gap-3">
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
                    <div className="xl:hidden flex items-center gap-1">
                        <button
                            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                            onClick={() => openCart?.()}
                            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                        >
                            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                            {cartCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-navigation"
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

            <div
                id="mobile-navigation"
                aria-hidden={!isMobileMenuOpen}
                className={`xl:hidden overflow-hidden border-b border-emerald-100 bg-white shadow-lg transition-[max-height,opacity] duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
            >
                    <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 pt-3 pb-5 text-left sm:px-6" aria-label="Mobile navigation">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => handleNavClick(link.name)}
                                    tabIndex={isMobileMenuOpen ? 0 : -1}
                                    className={`flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${activeLink === link.name
                                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                                        : 'text-stone-700 hover:bg-stone-50 hover:text-emerald-700'
                                        }`}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="mt-3 border-t border-stone-100 pt-3">
                            <a
                                href="#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                tabIndex={isMobileMenuOpen ? 0 : -1}
                                className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-800/20 transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                            >
                                <Stethoscope className="w-5 h-5 text-emerald-200" />
                                <span>Contact Doctor</span>
                            </a>
                        </div>
                    </nav>
            </div>
        </header>
    );
};

export default Navbar;
