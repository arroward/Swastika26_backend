"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu Items
  const menuItems = [
    { title: "Home", href: "#home" },
    { title: "About", href: "#about" },
    { title: "Events", href: "#events" },
    { title: "Proshows", href: "#proshow" },
    { title: "Gallery", href: "#gallery" },
    { title: "Sponsors", href: "#sponsors" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between pointer-events-none transition-all duration-300 ${scrolled ? "bg-black/50 backdrop-blur-md border-b border-white/5 py-4" : "py-6 mix-blend-difference"}`}
      >
        {/* LOGO */}
        <Link
          href="/"
          className="pointer-events-auto group flex items-center gap-3"
        >
          <img
            src="/logo/WH_LOGO.svg"
            alt="Swastika Logo"
            className="w-8 h-8 md:w-10 md:h-10 opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-cinzel font-black text-xl md:text-2xl tracking-tighter text-white group-hover:text-accent-main transition-colors duration-300">
            SWASTIKA
            <span className="text-accent-main text-3xl md:text-4xl leading-none">
              .
            </span>
            26
          </span>
        </Link>

        {/* DESKTOP MENU - Hidden on Mobile */}
        <div className="hidden md:flex items-center pointer-events-auto border border-white/10 rounded-full px-2 py-2 bg-black/20 backdrop-blur-md">
          {menuItems.slice(0, 4).map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="px-4 lg:px-6 py-2 text-xs lg:text-sm font-syne uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="#"
            className="ml-2 px-4 lg:px-6 py-2 bg-white text-black rounded-full font-bold font-syne uppercase text-xs lg:text-sm tracking-wider hover:bg-accent-main hover:text-white transition-all flex items-center gap-2"
          >
            Register <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden pointer-events-auto text-white p-2"
        >
          <Menu size={32} />
        </button>
      </motion.nav>

      {/* FULLSCREEN MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <X size={48} />
            </button>

            {/* Menu Links */}
            <div className="flex flex-col gap-8 text-center">
              {menuItems.map((item, i) => (
                <div
                  key={i}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-cinzel font-black text-5xl md:text-7xl text-transparent stroke-text hover:text-white transition-colors duration-300 uppercase"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>

            {/* Footer in Menu */}
            <div className="absolute bottom-12 text-white/30 font-mono text-sm">
              SWASTIKA 2026 • FEB 20-21
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
