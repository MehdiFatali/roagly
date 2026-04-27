/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { translations, Language } from './lib/translations';
import { Helmet } from 'react-helmet-async';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import Categories from './components/Categories';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Shop from './components/Shop';
import ProductDetail from './components/ProductDetail';
import AdminPanel from './components/AdminPanel';
import Wishlist from './components/Wishlist';
import About from './components/About';

export default function App() {
  const [lang, setLang] = useState<Language>('az');
  const t = translations[lang];

  const [currentPage, setCurrentPage] = useState<'home' | 'shop' | 'admin' | 'product' | 'about' | 'faq'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // SEO metadata based on current state
  const seoData = {
    title: selectedProduct && currentPage === 'product' 
      ? `${selectedProduct.name} | ROAGLY` 
      : currentPage === 'shop' 
      ? `Arsenal | ROAGLY` 
      : currentPage === 'about'
      ? `Haqqımızda | ROAGLY`
      : `ROAGLY | Premium Fitness Gear`,
    description: (selectedProduct && currentPage === 'product')
      ? (selectedProduct.shortDescription || selectedProduct.description.slice(0, 160))
      : t.hero.description,
    image: selectedProduct?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop'
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, size?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId: string, size: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === size) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-brand-black selection:bg-brand-white selection:text-brand-black font-sans">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={seoData.image} />
      </Helmet>
      
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onNavigate={setCurrentPage}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onShopNow={() => setCurrentPage('shop')} t={t} />
              <FeaturedProducts products={products.slice(0, 8)} onProductClick={openProduct} t={t} />
            </motion.div>
          )}

          {currentPage === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Shop 
                products={products} 
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onProductClick={openProduct} 
                t={t} 
              />
            </motion.div>
          )}

          {(currentPage === 'about' || currentPage === 'faq') && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <About t={t} />
            </motion.div>
          )}

          {currentPage === 'product' && selectedProduct && (
            <motion.div
              key="product"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductDetail 
                product={selectedProduct} 
                onAddToCart={addToCart} 
                onBack={() => setCurrentPage('shop')}
                t={t}
              />
            </motion.div>
          )}

          {currentPage === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel products={products} t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={setCurrentPage} t={t} />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
        t={t}
      />

      <Wishlist 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        products={products}
        onToggleWishlist={toggleWishlist}
        onProductClick={openProduct}
        t={t}
      />
    </div>
  );
}



