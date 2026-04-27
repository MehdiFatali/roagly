import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { Search, SlidersHorizontal, ArrowRight, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShopProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onProductClick: (p: Product) => void;
  t: any;
}

const CATEGORIES = ["All", "Fitness Clothes", "Protein", "Creatine", "Accessories"];

export default function Shop({ products, wishlist, onToggleWishlist, onProductClick, t }: ShopProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceRange]);

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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="pt-32 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen bg-brand-black text-brand-ink">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-10 md:mb-12">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-3 italic text-brand-white">{t.shop.title}</h1>
          <p className="text-brand-ink/40 text-[8px] md:text-[10px] max-w-xs uppercase tracking-widest leading-relaxed font-bold">{t.shop.description}</p>
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-ink/20 group-focus-within:text-brand-ink transition-colors" size={14} />
            <input 
              type="text" 
              placeholder={t.shop.search} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-4 py-2 bg-transparent border-b border-brand-white/10 focus:border-brand-white outline-none w-full md:w-48 transition-all uppercase text-[9px] font-black tracking-widest text-brand-ink"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all pb-1 border-b",
              showFilters ? "opacity-100 border-brand-white" : "opacity-30 border-transparent hover:opacity-100"
            )}
          >
            <SlidersHorizontal size={12} /> {t.shop.filters}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12 pb-10 border-b border-brand-white/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-ink/30 mb-6">{t.shop.categories}</h3>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] transition-all relative py-1",
                        selectedCategory === cat || (cat === "All" && selectedCategory === t.shop.all)
                          ? "opacity-100" 
                          : "opacity-30 hover:opacity-100"
                      )}
                    >
                      {cat === "All" ? t.shop.all : cat}
                      {(selectedCategory === cat || (cat === "All" && selectedCategory === t.shop.all)) && (
                        <motion.div layoutId="cat-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-ink/30 mb-6">{t.shop.priceRange}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="0"
                      value={priceRange[0]}
                      step={10}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-brand-white/[0.03] p-3 text-[9px] font-black border border-brand-white/5 focus:border-brand-white/20 outline-none text-brand-ink rounded-md transition-colors"
                    />
                    <span className="opacity-10">—</span>
                    <input 
                      type="number" 
                      min="0"
                      value={priceRange[1]}
                      step={10}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-brand-white/[0.03] p-3 text-[9px] font-black border border-brand-white/5 focus:border-brand-white/20 outline-none text-brand-ink rounded-md transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 border-t border-brand-white/5"
      >
        {filteredProducts.map((p, index) => (
          <motion.div
            key={p.id}
            variants={itemVariants}
            className="group cursor-pointer border-b border-brand-white/5 sm:border-r p-2 md:p-3 hover:bg-brand-white/[0.02] transition-colors relative flex flex-col"
            onClick={() => onProductClick(p)}
          >
            <div className="aspect-[3/4] bg-brand-gray/30 overflow-hidden mb-3 relative shrink-0">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                src={p.imageUrls[0] || null} 
                alt={p.name} 
                className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(p.id);
                }}
                className="absolute top-1 right-1 p-1.5 bg-brand-black/40 backdrop-blur-md rounded-full border border-brand-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand-black/80 z-10"
              >
                <Heart 
                  size={10} 
                  strokeWidth={1.5}
                  className={cn(
                    "transition-colors", 
                    wishlist.includes(p.id) ? "fill-brand-white text-brand-white" : "text-brand-ink/40"
                  )} 
                />
              </button>
              
              {/* Index Number */}
              <span className="absolute top-1 left-1 text-[6px] font-black opacity-10 group-hover:opacity-30 transition-opacity">
                #{index + 1}
              </span>

              {/* Stock Status Label */}
              {p.stock !== undefined && (
                <div className="absolute bottom-1 left-1">
                  {p.stock === 0 ? (
                    <span className="bg-red-500/80 backdrop-blur-md text-[5px] font-black uppercase tracking-widest px-1.5 py-0.5 italic text-white">
                      {t.common.outOfStock}
                    </span>
                  ) : p.stock <= 5 ? (
                    <span className="bg-brand-white text-brand-black backdrop-blur-md text-[5px] font-black uppercase tracking-widest px-1.5 py-0.5 italic border border-black/10">
                      {t.common.lowStock.replace('{n}', p.stock.toString())}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="space-y-0.5">
                <p className="text-[6px] font-black uppercase tracking-[0.3em] text-brand-ink/20">{p.category}</p>
                <h3 className="line-clamp-2 text-[9px] font-black uppercase tracking-wider text-brand-ink leading-tight group-hover:text-brand-white transition-colors">{p.name}</h3>
              </div>
              <div className="flex justify-between items-center border-t border-brand-white/5 pt-2 mt-auto">
                <p className="text-[10px] font-black text-brand-white">{formatPrice(p.price)}</p>
                <ArrowRight size={8} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-ink" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="py-60 text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-20">{t.shop.noResults}</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setPriceRange([0, 1000]);
            }}
            className="text-[10px] font-bold uppercase tracking-widest border-b border-white pb-1 opacity-40 hover:opacity-100 transition-opacity text-white"
          >
            {t.shop.reset}
          </button>
        </div>
      )}
    </div>
  );
}

