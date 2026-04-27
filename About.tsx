import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface AboutProps {
  t: any;
}

export default function About({ t }: AboutProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
  ];

  return (
    <div className="pt-32 pb-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen bg-brand-black text-brand-ink">
      {/* About Section */}
      <section className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-ink/20">{t.common.about}</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9] text-brand-white">{t.about.title}</h1>
          </div>
          <p className="text-lg md:text-xl font-medium text-brand-ink/60 leading-relaxed max-w-2xl italic">
            "{t.about.content}"
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-black/5">
             <div className="space-y-2">
                <div className="text-2xl font-black italic text-brand-white">100%</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20">Original</div>
             </div>
             <div className="space-y-2">
                <div className="text-2xl font-black italic text-brand-white">24/7</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20">Support</div>
             </div>
             <div className="space-y-2">
                <div className="text-2xl font-black italic text-brand-white">Fast</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20">Delivery</div>
             </div>
             <div className="space-y-2">
                <div className="text-2xl font-black italic text-brand-white">Premium</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20">Quality</div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-ink/20">{t.common.faq}</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none text-brand-white">{t.faq.title}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-black/5">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center py-6 text-left group"
                >
                  <span className="text-sm font-black uppercase tracking-widest group-hover:text-brand-ink/60 transition-colors">{faq.q}</span>
                  <ChevronDown className={cn("transition-transform duration-500 opacity-20", openFaq === idx && "rotate-180 opacity-100")} size={16} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="pb-8 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ink/40 leading-loose">
                    {faq.a}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
