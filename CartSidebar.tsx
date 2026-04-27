import React from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { formatPrice } from '../lib/utils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, size: string | undefined, delta: number) => void;
  onRemove: (id: string, size?: string) => void;
  total: number;
  t: any;
}

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  total,
  t
}: CartSidebarProps) {
  
  const handleWhatsAppOrder = async () => {
    // Notify server about the order
    try {
      fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity, size: item.selectedSize })),
          total: total,
          customerEmail: 'WhatsApp User'
        }),
      });
    } catch (error) {
      console.error('Order notification error:', error);
    }

    const itemsText = cart.map(item => 
      `• ${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const message = `🔔 ${t.cart.orderTitle}\n\n${itemsText}\n\n💰 ${t.cart.total}: ${formatPrice(total)}\n\n${t.cart.checkoutNotice}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/994993069910?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-brand-black z-[70] flex flex-col shadow-2xl border-l border-brand-white/5"
          >
            <div className="p-6 md:p-8 border-b border-brand-white/5 flex justify-between items-center bg-brand-black text-brand-ink">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} className="text-brand-white" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-brand-white">{t.cart.title}</h2>
                <span className="text-[10px] bg-brand-white text-brand-black px-2 py-0.5 font-black rounded-sm">{cart.length}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-white/5 transition-colors rounded-full text-brand-ink"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scrollbar-hide text-brand-ink">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                  <ShoppingBag size={48} strokeWidth={0.5} className="text-brand-ink" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ink">{t.cart.empty}</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}-${idx}`} className="flex gap-6 group">
                    <div className="w-24 h-32 bg-brand-gray/30 shrink-0 overflow-hidden rounded-xl md:rounded-none">
                      <img 
                        src={item.imageUrls[0] || null} 
                        alt={item.name} 
                        className="w-full h-full object-cover grayscale brightness-105 group-hover:brightness-100 transition-all duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-white">{item.name}</h3>
                          <button 
                            onClick={() => onRemove(item.id, item.selectedSize)}
                            className="text-brand-ink/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {item.selectedSize && (
                          <p className="text-[8px] font-black uppercase tracking-widest text-brand-ink/30 mb-2">{t.cart.size}: {item.selectedSize}</p>
                        )}
                        <p className="text-xs font-black text-brand-ink">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className="flex items-center border border-brand-white/5 bg-brand-gray/20 overflow-hidden rounded-lg">
                             <button 
                                onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)}
                                className="p-2 hover:bg-brand-white/5 opacity-40 hover:opacity-100 transition-all text-brand-ink"
                             >
                                <Minus size={10} />
                             </button>
                             <span className="w-8 text-center text-[10px] font-black text-brand-ink">{item.quantity}</span>
                             <button 
                                onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)}
                                className="p-2 hover:bg-brand-white/5 opacity-40 hover:opacity-100 transition-all text-brand-ink"
                             >
                                <Plus size={10} />
                             </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 md:p-8 border-t border-brand-white/5 bg-brand-black space-y-8">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-ink/30">{t.cart.subtotal}</span>
                  <span className="text-2xl font-black tracking-tighter italic text-brand-white">{formatPrice(total)}</span>
                </div>
                
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-brand-white text-brand-black py-5 flex items-center justify-center gap-4 font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-brand-white/5 rounded-xl md:rounded-none"
                >
                  <Send size={14} /> {t.cart.checkout}
                </button>
                
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-ink/10 text-center leading-relaxed">
                  {t.cart.checkoutNotice}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

