import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  products: Product[];
  onProductClick: (p: Product) => void;
  t: any;
}

export default function FeaturedProducts({ products, onProductClick, t }: FeaturedProductsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto bg-brand-black">
      <div className="flex justify-between items-end mb-10 md:mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none text-brand-white italic">{t.home.newArrivals}</h2>
        </motion.div>
        <button className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border-b border-brand-white/10 pb-1 hover:border-brand-white transition-all text-brand-ink/40 hover:text-brand-ink">
          {t.home.viewAll}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 border-t border-brand-white/5"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="group cursor-pointer border-b border-brand-white/5 sm:border-r p-2 md:p-3 hover:bg-brand-white/[0.01] transition-colors relative flex flex-col"
            onClick={() => onProductClick(product)}
          >
            <div className="aspect-[3/4] bg-brand-gray/30 overflow-hidden mb-3 relative shrink-0">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                src={product.imageUrls[0] || null}
                alt={product.name}
                className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 text-[6px] font-black opacity-10 group-hover:opacity-30 transition-opacity uppercase tracking-widest leading-none">
                FEAT.{index + 1}
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-brand-ink/20">{product.category}</p>
                <h3 className="line-clamp-2 text-[10px] font-black uppercase tracking-wider text-brand-ink leading-tight group-hover:text-brand-white transition-colors">{product.name}</h3>
              </div>
              <div className="flex justify-between items-center border-t border-brand-white/5 pt-3 mt-auto">
                <p className="text-[11px] font-black text-brand-white">{formatPrice(product.price)}</p>
                <ArrowRight size={10} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-ink" />
              </div>
            </div>
          </motion.div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-40 text-center border border-dashed border-brand-white/5">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20 text-white">No assets deployed</p>
          </div>
        )}
      </motion.div>
    </section>
  );
}

