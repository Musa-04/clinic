import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import WhatWeTreat from './components/WhatWeTreat';
import Doctors from './components/Doctors';
import WhyChooseUs from './components/WhyChooseUs';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import { Stethoscope, Phone, Clock, Send } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-800 antialiased selection:bg-emerald-200 selection:text-emerald-900 w-full max-w-full overflow-x-hidden">

      {/* 1. Responsive Navbar */}
      <Navbar />

      {/* Main Content Body */}
      <main className="flex-grow w-full max-w-full">

        {/* 2. Mobile-First Hero Section */}
        <Hero />

        {/* 3. About Malik's Polyclinic */}
        <About />

        {/* 4. Our Medicines / Products */}
        <Products />

        {/* 5. Responsive What We Treat Section */}
        <WhatWeTreat />

        {/* 6. Responsive Meet Our Doctors Section */}
        <Doctors />

        {/* 7. Why Choose Malik's Polyclinic */}
        <WhyChooseUs />

        {/* 8. How It Works */}
        <HowItWorks />

        {/* 9. Mobile-First Contact & Appointment Section */}
        <section id="contact" className="py-14 sm:py-20 bg-gradient-to-b from-stone-100 to-emerald-950 text-white relative w-full max-w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-10 lg:p-12 border border-emerald-700/40 shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center text-left">

              {/* Left Column Text */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-semibold uppercase tracking-wider max-w-full">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Personalized Medical Care</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
                  Book a Consultation at Malik's Polyclinic
                </h2>

                <p className="text-emerald-100/80 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Consult with Dr. Mozim Malik (BHMS, CCH) or Dr. Karishma Malik (BAMS, YIC) for natural, root-cause healing tailored specifically for your body.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/60">
                    <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-300">Call / WhatsApp</p>
                      <p className="font-bold text-white">Contact Doctors</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-800/60">
                    <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-300">Clinic Hours</p>
                      <p className="font-bold text-white">Mon - Sat (9AM - 7PM)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Quick Appointment Inquiry Form */}
              <div className="lg:col-span-5 bg-white text-stone-900 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xl border border-stone-200 w-full max-w-full">
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-1">Schedule Consultation</h3>
                <p className="text-stone-500 text-xs mb-5">Fill in your details and our clinic team will get in touch.</p>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Select Doctor / Specialty</label>
                    <select className="w-full px-3.5 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm text-stone-800 bg-white min-h-[44px]">
                      <option>Dr. Mozim Malik (Homeopathy - BHMS, CCH)</option>
                      <option>Dr. Karishma Malik (Ayurveda - BAMS, YIC)</option>
                      <option>General Consultation / First Visit</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-700 active:bg-emerald-800 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 transition-colors min-h-[48px] cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Send Consultation Request</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 6. Mobile-First Footer */}
      <Footer />

    </div>
  );
}

export default App;
