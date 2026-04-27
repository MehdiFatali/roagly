import React from 'react';
import { Instagram, Phone, MapPin, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: any) => void;
  t: any;
}

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.617a8.171 8.171 0 0 0 4.773 1.574V6.747c-.363-.016-.713-.042-1.003-.061z"/>
  </svg>
);

export default function Footer({ onNavigate, t }: FooterProps) {
  return (
    <footer className="bg-brand-black text-brand-ink py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-black/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-24 md:mb-40">
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-black tracking-tighter mb-8 italic text-brand-white">ROAGLY</h2>
            
            <div className="flex space-x-8 opacity-30 text-brand-ink">
              <a 
                href="https://www.instagram.com/roagly/?utm_source=ig_web_button_share_sheet" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-100 transition-opacity hover:text-brand-white"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a 
                href="https://www.tiktok.com/@roagly?is_from_webapp=1&sender_device=pc" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-100 transition-opacity hover:text-brand-white flex items-center justify-center translate-y-[1px]"
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12 opacity-20">{t.nav.categories}</h4>
            <ul className="space-y-4 md:space-y-6 text-[10px] font-black uppercase tracking-[0.2em]">
              <li><button onClick={() => onNavigate('home')} className="hover:text-brand-white transition-opacity">{t.nav.home}</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-brand-white transition-opacity">{t.nav.shop}</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-brand-white transition-opacity">{t.common.about}</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-brand-white transition-opacity">{t.common.faq}</button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-brand-white transition-opacity">{t.nav.admin}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 md:mb-12 opacity-20">Support</h4>
            <ul className="space-y-4 md:space-y-6 text-[10px] font-black tracking-[0.2em] opacity-40 uppercase">
              <li className="flex items-center gap-3 hover:text-brand-white transition-colors cursor-pointer lowercase">
                <Mail size={12} strokeWidth={1.5} /> roalgyfit@gmail.com
              </li>
              <li className="flex items-center gap-3 hover:text-brand-white transition-colors cursor-pointer text-brand-white">
                <Phone size={12} strokeWidth={1.5} /> 099 306 99 10
              </li>
              <li className="flex items-center gap-3 hover:text-brand-white transition-colors cursor-pointer capitalize">
                <MapPin size={12} strokeWidth={1.5} /> Baku, Azerbaijan
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-black/5">
          <p className="text-[8px] uppercase tracking-[0.5em] font-bold opacity-10 text-center md:text-left">
            © {new Date().getFullYear()} ROAGLY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-10 opacity-10">
             <span className="text-[10px] font-black tracking-tighter italic grayscale">VISA</span>
             <span className="text-[10px] font-black tracking-tighter italic grayscale">MASTERCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

