import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoriesProps {
  onSelectCategory: (name: string) => void;
  t: any;
}

const categories = [
  { 
    name: 'Fitness Clothes', 
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  },
  { 
    name: 'Protein', 
    image: 'https://images.unsplash.com/photo-1593092283814-155bc88960b7?q=80&w=1200&auto=format&fit=crop',
  },
  { 
    name: 'Creatine', 
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop',
  },
  { 
    name: 'Accessories', 
    image: 'https://images.unsplash.com/photo-1517438322351-372810eba642?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function Categories({ onSelectCategory, t }: CategoriesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 1.05, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="py-20 md:py-32 bg-brand-black px-4 sm:px-6 lg:px-8 border-t border-brand-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-2xl md:text-5xl font-black tracking-tighter uppercase mb-12 md:mb-24 text-center italic text-brand-white"
        >
          {t.home.equipmentTiers}
        </motion.h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={itemVariants}
              className="group relative overflow-hidden bg-brand-gray/30 cursor-pointer aspect-[3/4] rounded-2xl md:rounded-none"
              onClick={() => onSelectCategory(cat.name)}
            >
              <motion.img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover grayscale brightness-105 group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-1000"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-brand-black to-transparent">
                <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase mb-2 transform group-hover:-translate-y-2 transition-transform duration-500 text-brand-white italic">{cat.name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-brand-white">
                  {t.home.explore} <ArrowRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
