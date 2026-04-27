import React, { useState } from 'react';
import { ShoppingBag, Menu, X, User, Globe, Heart, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Language } from '../lib/translations';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onNavigate: (page: any) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
}

export default function Navbar({ 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onNavigate, 
  lang, 
  setLang, 
  t 
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: t.nav.home, action: () => onNavigate('home') },
    { name: t.nav.shop, action: () => onNavigate('shop') },
    { name: t.nav.about || 'ABOUT', action: () => onNavigate('about') },
    { name: t.nav.faq || 'FAQ', action: () => onNavigate('faq') },
    { name: t.nav.admin, action: () => onNavigate('admin') },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'az', label: 'AZ' },
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-black/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-white flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <span className="text-brand-black font-black text-lg md:text-xl italic">R</span>
            </div>
            <span className="text-lg md:text-2xl font-black tracking-tighter text-brand-ink uppercase italic">
              ROAGLY
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-12">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-ink/40 hover:text-brand-ink transition-all relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-brand-ink group-hover:w-full transition-all duration-500" />
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-brand-ink"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} strokeWidth={1.2} /> : <Sun size={20} strokeWidth={1.2} />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1 text-[10px] font-bold text-brand-ink"
              >
                <Globe size={18} strokeWidth={1.2} />
                <span className="hidden sm:inline uppercase">{lang}</span>
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 bg-brand-black border border-black/5 shadow-2xl p-2 min-w-[80px] rounded-lg"
                  >
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "block w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 hover:bg-black/5 rounded",
                          lang === l.code && "bg-brand-white text-brand-black hover:bg-brand-white/90"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={onOpenWishlist}
              className="relative p-2 hover:bg-black/5 rounded-full transition-colors text-brand-ink"
            >
              <Heart size={20} strokeWidth={1.2} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-brand-white text-brand-black text-[7px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={onOpenCart}
              className="relative p-2 hover:bg-black/5 rounded-full transition-colors text-brand-ink"
            >
              <ShoppingBag size={20} strokeWidth={1.2} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-white text-brand-black text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              className="lg:hidden p-2 hover:bg-black/5 rounded-full transition-colors text-brand-ink"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-brand-black border-b border-black/5 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-12 space-y-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    link.action();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-2xl font-black uppercase tracking-tighter text-brand-white italic"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

