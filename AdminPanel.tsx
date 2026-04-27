import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { Plus, Trash2, Edit, LogOut, ChevronRight, Save, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  products: Product[];
  t: any;
}

export default function AdminPanel({ products, t }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null); // Progress percentage

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email?.toLowerCase() === 'feteliyevmehdi88@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const adminQuery = query(collection(db, 'admins'), where('email', '==', u.email));
            const snapshot = await getDocs(adminQuery);
            setIsAdmin(!snapshot.empty);
          } catch (e) {
            console.error("error checking admin status", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("[AUTH] Starting login...");
      const result = await signInWithPopup(auth, provider);
      console.log("[AUTH] Login successful for:", result.user.email);
    } catch (error: any) {
      console.error("[AUTH] Detailed error:", error);
      alert(`Giriş xətası: ${error.message}\nKod: ${error.code}`);
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("[AUTH] Popup user tərəfindən bağlandı.");
        return;
      }
      if (error.code === 'auth/unauthorized-domain') {
        alert("BU DOMAIN FIREBASE-DƏ İCAZƏ VERİLMƏYİB! Firebase Console-da (Authentication > Settings > Authorized domains) saytınızın URL-ni əlavə edin.");
      }
    }
  };

  const logout = () => signOut(auth);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mobile photos are huge. Let's compress/resize if needed.
    // We'll use a simple Canvas resize to keep it under 1.5MB and 1200px
    setUploading(5);

    try {
      let fileToUpload = file;
      
      // Simple client-side resize logic to keep quality but ensure it's not massive
      if (file.type.startsWith('image/') && (file.size > 2 * 1024 * 1024)) {
        console.log("[STORAGE] Large image detected, optimization starting...", file.size);
        const img = new Image();
        
        const compressedFile = await new Promise<File>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 1600; // Better quality
              
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = (height / width) * maxDim;
                  width = maxDim;
                } else {
                  width = (width / height) * maxDim;
                  height = maxDim;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else {
                  reject(new Error("Sıxılma alınmadı"));
                }
              }, 'image/jpeg', 0.9); // High quality
            };
            img.onerror = () => reject(new Error("Şəkil oxunarkən xəta"));
            img.src = ev.target?.result as string;
          };
          reader.onerror = () => reject(new Error("Fayl oxunmadı"));
          reader.readAsDataURL(file);
        });
        fileToUpload = compressedFile;
      }

      setUploading(25);
      
      const fileName = `${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Use our backend API to upload to Vercel Blob
      const formData = new FormData();
      formData.append('file', fileToUpload, fileName);

      console.log("[STORAGE] Vercel Blob-ə yüklənilir...");
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed (${response.status})`);
        } else {
          const errorText = await response.text();
          console.error("[STORAGE] Server error (HTML/Text):", errorText.substring(0, 500));
          throw new Error(`Server xətası (${response.status}). Zəhmət olmasa logları yoxlayın.`);
        }
      }

      const blob = await response.json();
      const downloadURL = blob.url;
      
      console.log("[STORAGE] Success! Blob URL:", downloadURL);

      setEditingProduct(prev => {
        if (!prev) return null;
        const newUrls = [...(prev.imageUrls || [])];
        newUrls[index] = downloadURL;
        return { ...prev, imageUrls: newUrls };
      });
      setUploading(null);
    } catch (error: any) {
      console.error("[STORAGE] Ümumi xəta:", error);
      setUploading(null);
      alert(`Yükləmə xətası: ${error.message}`);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const data = {
      ...editingProduct,
      price: Number(editingProduct.price),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProduct.id) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, data as any);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Error saving product:", err);
      alert(`Xəta: ${err.message || 'Məhsul yadda saxlanılmadı'}`);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Bu əməliyyat üçün admin yetkiniz yoxdur.");
      return;
    }

    setDeletingId(id);
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Firestore error during deletion:", err);
      alert(err.code === 'permission-denied' ? "İcazə rədd edildi." : `Xəta: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-brand-black">
      <div className="w-[1px] h-20 bg-white animate-pulse opacity-10" />
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black pt-24 px-6 md:pt-20">
        <div className="w-full max-w-sm space-y-10 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">ROAGLY</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-20 text-white">{t.admin.title}</p>
          </div>
          
          <button 
            onClick={login}
            className="w-full py-5 md:py-6 min-h-[56px] bg-white text-black font-bold uppercase tracking-[0.4em] text-[10px] md:text-[11px] hover:invert transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 rounded-xl"
          >
            {t.admin.loginGoogle} <ChevronRight size={14} />
          </button>
          
          {user && !isAdmin && (
            <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest opacity-80">
              {t.admin.accessDenied}: {user.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen bg-brand-black text-brand-ink">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-12 md:mb-24 border-b border-brand-white/5 pb-10">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-brand-white">{t.admin.dashboard}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-brand-ink/30">
             <span>{user?.email}</span>
             <div className="flex items-center gap-2 border-l border-brand-white/10 pl-3 md:pl-0 md:border-none">
                <div className={cn("w-1.5 h-1.5 rounded-full", isAdmin ? "bg-green-500" : "bg-red-500")} />
                <span className={isAdmin ? "text-green-500/60" : "text-red-500/60"}>{isAdmin ? "VERIFIED ADMIN" : "UNAUTHORIZED"}</span>
             </div>
             <button onClick={logout} className="hover:text-brand-white flex items-center gap-1 transition-colors uppercase border-l border-brand-white/10 pl-3 md:pl-0 md:border-none">
               <LogOut size={12} /> {t.admin.logout}
             </button>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setEditingProduct({
              name: '',
              price: 0,
              description: '',
              category: 'Fitness Clothes',
              imageUrls: [''],
              sizes: [],
              stock: 0
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 px-12 py-5 min-h-[56px] bg-brand-white text-brand-black font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] hover:scale-[1.02] transition-all shadow-xl shadow-black/5 rounded-xl w-full sm:w-auto text-center justify-center"
        >
          <Plus size={16} /> {t.admin.addNewProduct}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(p => (
          <div key={p.id} className="group border border-brand-white/5 p-4 hover:bg-brand-white/[0.02] transition-all flex flex-col bg-brand-black rounded-2xl md:rounded-none">
            <div className="aspect-[4/5] bg-brand-gray/30 overflow-hidden mb-4 rounded-lg relative">
              <img src={p.imageUrls[0] || undefined} className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                 <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="p-3 md:p-2 bg-brand-white text-brand-black rounded-lg hover:invert transition-all"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => setShowConfirmDelete(p.id)}
                      className="p-3 md:p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all disabled:opacity-50"
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                 </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                 <div className="font-black uppercase tracking-widest text-[10px] italic leading-tight text-brand-white line-clamp-1">{p.name}</div>
                 <div className="text-[8px] font-black text-brand-ink/20 uppercase tracking-widest">{p.category}</div>
              </div>
              <div className="text-[12px] font-black pt-2 text-brand-ink mt-auto border-t border-brand-white/5 pt-3">
                 {formatPrice(p.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
              onClick={() => setShowConfirmDelete(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-black border border-red-500/20 p-8 w-full max-w-sm relative shadow-2xl rounded-3xl text-center space-y-8"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">{t.admin.deleteConfirm}</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed font-bold">BU ƏMƏLİYYAT GERİ QAYTARILA BİLMƏZ.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirmDelete(null)}
                  className="py-5 bg-brand-white/5 hover:bg-brand-white/10 text-brand-white text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl"
                >
                  LƏĞV ET
                </button>
                <button 
                  onClick={() => handleDelete(showConfirmDelete)}
                  className="py-5 bg-red-600 hover:bg-red-500 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-red-600/20"
                >
                  SİL
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
               onClick={() => setIsModalOpen(false)} 
             />
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-black text-brand-ink p-6 md:p-10 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-brand-white/5 shadow-2xl rounded-3xl"
             >
                <div className="flex justify-between items-center mb-10 md:mb-12 border-b border-brand-white/5 pb-6">
                  <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none text-brand-white">
                    {editingProduct?.id ? t.admin.editProduct : t.admin.addNewProduct}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 text-brand-ink/20 hover:text-brand-ink transition-opacity"><X size={24} /></button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.productName}</label>
                      <input 
                        required
                        type="text" 
                        value={editingProduct?.name}
                        onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})}
                        className="w-full p-5 bg-brand-gray/20 border border-brand-white/5 focus:border-brand-white/10 outline-none font-black uppercase italic tracking-tight text-[11px] md:text-xs transition-all text-brand-ink rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.price}</label>
                      <input 
                        required
                        type="number" 
                        value={editingProduct?.price}
                        onChange={e => setEditingProduct({...editingProduct!, price: Number(e.target.value)})}
                        className="w-full p-5 bg-brand-gray/20 border border-brand-white/5 focus:border-brand-white/10 outline-none font-black text-[11px] md:text-xs transition-all text-brand-ink rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.common.stockStatus} (Count)</label>
                      <input 
                        required
                        type="number" 
                        value={editingProduct?.stock || 0}
                        onChange={e => setEditingProduct({...editingProduct!, stock: Number(e.target.value)})}
                        className="w-full p-5 bg-brand-gray/20 border border-brand-white/5 focus:border-brand-white/10 outline-none font-black text-[11px] md:text-xs transition-all text-brand-ink rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 relative">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.category}</label>
                    <select 
                      value={editingProduct?.category}
                      onChange={e => setEditingProduct({...editingProduct!, category: e.target.value as any})}
                      className="w-full p-5 bg-brand-gray/20 border border-brand-white/5 focus:border-brand-white/10 outline-none font-black uppercase tracking-[0.3em] text-[11px] md:text-xs appearance-none cursor-pointer transition-all text-brand-ink rounded-xl"
                    >
                      <option value="Fitness Clothes">Fitness Clothes</option>
                      <option value="Protein">Protein</option>
                      <option value="Creatine">Creatine</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.imageUrls}</label>
                      <button 
                        type="button"
                        onClick={() => setEditingProduct(prev => prev ? ({...prev, imageUrls: [...(prev.imageUrls || []), '']}) : null)}
                        className="text-[9px] font-black uppercase border border-brand-white/10 px-3 py-1 rounded-lg hover:bg-brand-white/5 transition-colors"
                      >
                        + Add Another Image
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editingProduct?.imageUrls?.map((url, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 md:p-0 bg-brand-white/[0.02] md:bg-transparent rounded-xl">
                          <div className="w-20 h-24 md:w-16 md:h-20 bg-brand-gray/30 shrink-0 overflow-hidden border border-brand-white/5 rounded-xl flex items-center justify-center relative">
                            {url ? (
                                <img src={url} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={24} className="opacity-10 text-brand-ink" />
                            )}
                            {uploading !== null && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader2 className="text-white animate-spin" size={20} />
                                </div>
                            )}
                          </div>
                          <div className="flex-1 w-full flex flex-col gap-3">
                             <div className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Image URL"
                                    value={url}
                                    onChange={e => {
                                        const newVal = e.target.value;
                                        setEditingProduct(prev => {
                                          if (!prev) return null;
                                          const newUrls = [...(prev.imageUrls || [])];
                                          newUrls[idx] = newVal;
                                          return { ...prev, imageUrls: newUrls };
                                        });
                                    }}
                                    className="flex-1 p-4 bg-brand-gray/20 border border-brand-white/5 focus:border-brand-white/10 outline-none font-medium text-[11px] md:text-xs transition-all text-brand-ink rounded-xl"
                                />
                                <div className="flex gap-3">
                                  <button
                                      type="button"
                                      onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.onchange = (e) => handleFileUpload(e as any, idx);
                                          input.click();
                                      }}
                                      className="flex-1 sm:flex-none p-4 min-h-[48px] bg-brand-white text-brand-black rounded-xl hover:invert transition-all flex items-center justify-center gap-2 px-6"
                                      disabled={uploading !== null}
                                  >
                                      {uploading !== null ? (
                                          <>
                                              <Loader2 size={14} className="animate-spin" />
                                              <span className="text-[9px] font-black md:hidden uppercase">{t.admin.uploading}...</span>
                                          </>
                                      ) : (
                                          <>
                                              <Upload size={16} />
                                              <span className="text-[9px] font-black uppercase">{t.admin.upload}</span>
                                          </>
                                      )}
                                  </button>
                                  {editingProduct!.imageUrls!.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setEditingProduct(prev => {
                                              if (!prev) return null;
                                              const newUrls = (prev.imageUrls || []).filter((_, i) => i !== idx);
                                              return { ...prev, imageUrls: newUrls };
                                            });
                                        }}
                                        className="p-4 border border-red-500/20 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-colors sm:hidden"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                             </div>
                             {uploading !== null && (
                                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="bg-brand-white h-full" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploading}%` }}
                                    />
                                </div>
                             )}
                          </div>
                          {editingProduct!.imageUrls!.length > 1 && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setEditingProduct(prev => {
                                      if (!prev) return null;
                                      const newUrls = (prev.imageUrls || []).filter((_, i) => i !== idx);
                                      return { ...prev, imageUrls: newUrls };
                                    });
                                }}
                                className="hidden sm:block text-red-500/40 hover:text-red-500 p-2 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.sizes} ({t.admin.commaSeparated})</label>
                    <input 
                      type="text" 
                      placeholder="S, M, L, XL"
                      value={editingProduct?.sizes?.join(', ')}
                      onChange={e => setEditingProduct({...editingProduct!, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                      className="w-full p-5 bg-brand-gray/20 border border-black/5 focus:border-black/10 outline-none font-black uppercase tracking-widest text-[11px] md:text-xs text-brand-ink rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 px-1">{t.admin.description}</label>
                    <textarea 
                      required
                      value={editingProduct?.description}
                      onChange={e => setEditingProduct({...editingProduct!, description: e.target.value})}
                      className="w-full p-5 bg-brand-gray/20 border border-black/5 focus:border-black/10 outline-none font-medium h-40 text-[11px] md:text-xs leading-relaxed text-brand-ink rounded-xl"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-7 bg-brand-white text-brand-black font-black uppercase tracking-[0.5em] text-[10px] md:text-[11px] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-black/5 rounded-xl md:rounded-none"
                    disabled={uploading !== null || !isAdmin}
                  >
                    {editingProduct?.id ? t.admin.update : t.admin.save}
                  </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
