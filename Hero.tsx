import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  t: any;
}

export default function Hero({ onShopNow, t }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-black text-brand-ink">
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-0 w-full sm:w-1/2 h-full bg-brand-white/[0.03] -skew-x-12 translate-x-16 sm:translate-x-32" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-full sm:w-1/3 h-1/2 bg-brand-white/[0.02] skew-x-12 -translate-x-8 sm:-translate-x-16" 
        />
      </div>

      <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center select-none pointer-events-none overflow-hidden">
        <motion.span 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[40vw] font-black tracking-tighter leading-none italic whitespace-nowrap text-brand-white"
        >
          PERFORMANCE
        </motion.span>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl">
        <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-8 md:w-12 h-[1px] bg-brand-white opacity-20" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.6em] md:tracking-[0.8em] uppercase opacity-40">
              {t.hero.tagline}
            </span>
            <div className="w-8 md:w-12 h-[1px] bg-brand-white opacity-20" />
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] md:leading-[0.8] mb-8 md:mb-12 italic uppercase text-brand-white"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="max-w-xl mx-auto text-[10px] md:text-sm font-medium uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40 mb-12 md:mb-20 leading-loose"
          >
            {t.hero.description}
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16"
          >
            <button
              onClick={onShopNow}
              className="group relative w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              <div className="relative px-10 md:px-12 py-4 md:py-5 border border-brand-white text-brand-white group-hover:text-brand-black font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] flex items-center justify-center gap-4 transition-all duration-500">
                {t.hero.cta}
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            <button
              className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] opacity-30 hover:opacity-100 transition-all border-b border-transparent hover:border-brand-white/20 pb-2 hover:translate-x-1"
            >
              {t.hero.learnMore}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Extreme Minimal Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden sm:flex"
      >
        <span className="text-[8px] font-bold uppercase tracking-[0.5em] vertical-rl rotate-180 opacity-20 whitespace-nowrap">SCROLL</span>
        <div className="w-[1px] h-12 bg-brand-white opacity-20" />
      </motion.div>
    </section>
  );
}

