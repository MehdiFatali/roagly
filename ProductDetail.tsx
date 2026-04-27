import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Check, X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (p: Product, size?: string) => void;
  onBack: () => void;
  t: any;
}

export default function ProductDetail({ product, onAddToCart, onBack, t }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [added, setAdded] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleAdd = () => {
    if (product.stock === 0) return;
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-brand-black text-brand-ink min-h-screen">
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-brand-ink/40 hover:text-brand-ink mb-10 transition-colors group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform text-brand-white" /> {t.product.back}
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 border-t border-brand-white/5">
        {/* Gallery */}
        <div className="md:col-span-7 md:border-r border-brand-white/5 p-0 md:pr-10 md:py-10 space-y-4 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="aspect-[3/4] bg-brand-gray/30 overflow-hidden relative group rounded-lg md:rounded-none max-w-[400px] mx-auto"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                src={product.imageUrls[activeImage] || null} 
                alt={product.name} 
                className="w-full h-full object-cover grayscale brightness-105 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            {/* Image Counter */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[8px] font-black opacity-20 tracking-tighter">
              IMG.0{activeImage + 1} // 0{product.imageUrls.length}
            </div>

            {product.imageUrls.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : product.imageUrls.length - 1))}
                  className="p-2 md:p-3 bg-brand-black/40 backdrop-blur-md rounded-full border border-brand-white/5 hover:bg-brand-white hover:text-brand-black transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => (prev < product.imageUrls.length - 1 ? prev + 1 : 0))}
                  className="p-2 md:p-3 bg-brand-black/40 backdrop-blur-md rounded-full border border-brand-white/5 hover:bg-brand-white hover:text-brand-black transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 justify-center overflow-x-auto pb-4 scrollbar-hide"
          >
            {product.imageUrls.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "w-10 h-14 bg-brand-gray/30 overflow-hidden shrink-0 transition-all border rounded-md",
                  activeImage === idx ? "border-brand-white scale-110 z-10" : "border-transparent opacity-30 grayscale hover:opacity-100"
                )}
              >
                <img src={img || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-5 p-0 md:pl-10 md:py-10 space-y-8"
        >
          <div className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-ink/20">{product.category}</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-[0.9] italic text-brand-white">{product.name}</h1>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center justify-between border-y border-brand-white/5 py-4">
              <p className="text-lg md:text-xl font-light tracking-tighter text-brand-white">{formatPrice(product.price)}</p>
              
              {/* Stock Status */}
              {product.stock !== undefined && (
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-yellow-500 animate-pulse" : "bg-green-500/40"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                    {product.stock === 0 
                      ? t.common.outOfStock 
                      : product.stock <= 5 
                        ? t.common.lowStock.replace('{n}', product.stock.toString())
                        : t.common.inStock}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="space-y-3 md:space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-ink/20">{t.product.description}</h3>
            <p className="text-xs md:text-sm text-brand-ink/60 leading-relaxed font-medium uppercase tracking-widest">{product.description}</p>
          </motion.div>

          {product.sizes && product.sizes.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-end">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-ink/20">{t.product.selectSize}</h3>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all border-b border-brand-white/10 pb-1"
                >
                  <Ruler size={10} /> {t.common.sizeGuide}
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "flex-1 md:flex-none min-w-[60px] h-14 flex items-center justify-center font-black tracking-widest text-[11px] uppercase border transition-all duration-500 rounded-lg",
                      selectedSize === size 
                        ? "bg-brand-white border-brand-white text-brand-black scale-105" 
                        : "border-brand-white/5 hover:border-brand-white/40 opacity-20 hover:opacity-100 font-bold"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="pt-8 md:pt-12">
            <button 
              onClick={handleAdd}
              disabled={added || product.stock === 0}
              className={cn(
                "w-full py-6 md:py-8 flex items-center justify-center gap-6 font-black uppercase tracking-[0.6em] text-[11px] transition-all duration-700 relative overflow-hidden group rounded-xl",
                product.stock === 0 ? "bg-brand-white/5 text-brand-ink/20 cursor-not-allowed" : (added ? "bg-brand-white text-brand-black" : "bg-brand-white text-brand-black")
              )}
            >
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-brand-ink transition-transform duration-500" />
              <span className="relative z-10 flex items-center gap-4 group-hover:text-brand-white transition-colors duration-500">
                {product.stock === 0 ? (
                  t.common.outOfStock
                ) : added ? (
                  <>
                    <Check size={16} /> {t.product.added}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={1.5} /> {t.product.addToCart}
                  </>
                )}
              </span>
            </button>
          </motion.div>

          {/* Minimal details */}
          <motion.div variants={itemVariants} className="pt-16 md:pt-24 grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-16 border-t border-brand-white/5">
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-ink/20">{t.product.delivery}</h4>
                <p className="text-[11px] font-medium leading-loose opacity-40 uppercase tracking-widest">{t.product.deliveryDesc}</p>
             </div>
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-ink/20">{t.product.returns}</h4>
                <p className="text-[11px] font-medium leading-loose opacity-40 uppercase tracking-widest">{t.product.returnsDesc}</p>
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-md" 
               onClick={() => setIsSizeGuideOpen(false)} 
             />
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-gray text-white p-10 w-full max-w-lg relative border border-white/5 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">
                    {t.common.sizeGuide}
                  </h2>
                  <button onClick={() => setIsSizeGuideOpen(false)} className="text-white/20 hover:text-white transition-opacity"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                  <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest leading-loose">
                    <thead className="opacity-20 border-b border-white/5">
                      <tr>
                        <th className="py-4">Size</th>
                        <th className="py-4">Chest (cm)</th>
                        <th className="py-4">Waist (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="opacity-60">
                      <tr className="border-b border-white/5">
                        <td className="py-4">S</td>
                        <td className="py-4">88 - 96</td>
                        <td className="py-4">73 - 81</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-4">M</td>
                        <td className="py-4">96 - 104</td>
                        <td className="py-4">81 - 89</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-4">L</td>
                        <td className="py-4">104 - 112</td>
                        <td className="py-4">89 - 97</td>
                      </tr>
                      <tr>
                        <td className="py-4">XL</td>
                        <td className="py-4">112 - 124</td>
                        <td className="py-4">97 - 109</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

