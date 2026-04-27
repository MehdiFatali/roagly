import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: string[];
  products: Product[];
  onToggleWishlist: (id: string) => void;
  onProductClick: (p: Product) => void;
  t: any;
}

export default function Wishlist({ 
  isOpen, 
  onClose, 
  wishlist, 
  products, 
  onToggleWishlist, 
  onProductClick,
  t 
}: WishlistProps) {
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-brand-black z-[90] flex flex-col shadow-2xl border-l border-brand-white/5"
          >
            <div className="p-6 md:p-8 border-b border-brand-white/5 flex justify-between items-center text-brand-ink">
              <div className="flex items-center gap-3">
                <Heart size={18} strokeWidth={1.5} className="fill-brand-white text-brand-white" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-brand-white">{t.common.wishlist}</h2>
                <span className="text-[10px] bg-brand-white text-brand-black px-2 py-0.5 font-black rounded-sm">{wishlistProducts.length}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-white/5 transition-colors rounded-full text-brand-ink"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide text-brand-ink">
              {wishlistProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6 text-center">
                  <Heart size={64} strokeWidth={0.5} className="text-brand-ink" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-loose text-brand-ink">
                    {t.shop.noResults}
                  </p>
                </div>
              ) : (
                wishlistProducts.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div 
                      className="w-24 h-32 md:w-28 md:h-36 bg-brand-gray/30 shrink-0 overflow-hidden cursor-pointer rounded-xl md:rounded-none"
                      onClick={() => { onProductClick(item); onClose(); }}
                    >
                      <img 
                        src={item.imageUrls[0] || null} 
                        alt={item.name} 
                        className="w-full h-full object-cover grayscale brightness-105 group-hover:brightness-100 transition-all duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-brand-ink/60 transition-colors text-brand-white"
                            onClick={() => { onProductClick(item); onClose(); }}
                          >
                            {item.name}
                          </h3>
                          <button 
                            onClick={() => onToggleWishlist(item.id)}
                            className="text-brand-ink/20 hover:text-brand-ink transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-brand-ink/30 mb-4">{item.category}</p>
                        <p className="text-sm font-black text-brand-ink">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="pt-4">
                         <button 
                            onClick={() => { onProductClick(item); onClose(); }}
                            className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all text-brand-ink"
                         >
                            {t.home.explore} <ArrowRight size={10} />
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
