import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Plus, Search, 
  Clock, ChefHat, 
  ChevronRight, X, Image as ImageIcon,
  Book, AlignLeft, List, Target,
  CheckCircle2, Sparkles, Utensils
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';
import { INITIAL_RECIPES } from '../../data/recipes';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  category: string;
  image?: string;
  createdAt: any;
}

interface RecipeAppProps {
  onClose: () => void;
  user: any;
}

const CATEGORIES = ['Mind', 'Reggeli', 'Ebéd', 'Vacsora', 'Desszert', 'Snack'];

export default function RecipeApp({ onClose, user }: RecipeAppProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Mind');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form
  const [newTitle, setNewTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newCategory, setNewCategory] = useState('Mind');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (!user) return;

    const recipesRef = collection(db, 'users', user.uid, 'recipes');
    
    const checkAndInitialize = async () => {
      const snapshot = await getDocs(recipesRef);
      if (snapshot.empty) {
        for (const recipe of INITIAL_RECIPES) {
          await addDoc(recipesRef, {
            ...recipe,
            createdAt: Timestamp.now()
          });
        }
      }
    };
    
    checkAndInitialize();

    const q = query(recipesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setRecipes(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/recipes`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async () => {
    if (!newTitle || !newIngredients || !newInstructions || !user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'recipes'), {
        title: newTitle,
        ingredients: newIngredients,
        instructions: newInstructions,
        category: newCategory === 'Mind' ? 'Ebéd' : newCategory,
        image: newImage || null,
        createdAt: Timestamp.now()
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewIngredients('');
      setNewInstructions('');
      setNewImage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/recipes`);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const filtered = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Mind' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden text-[#1A1817] font-sans w-full max-w-full">
      <AnimatePresence mode="wait">
        {!selectedRecipe ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {/* Elegant Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Header */}
            <div className="p-6 sm:p-10 pb-6 flex items-end justify-between shrink-0 relative z-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-2">
                   <button onClick={onClose} className="p-2.5 -ml-2 hover:bg-zinc-100 rounded-xl transition-all active:scale-90 bg-white shadow-sm border border-zinc-100">
                     <ChevronLeft size={20} />
                   </button>
                   <span className="text-[10px] font-black tracking-[.4em] uppercase text-orange-600">Premium Library</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none italic font-serif">A Konyhám</h1>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:rotate-90 shrink-0"
              >
                <Plus size={28} />
              </button>
            </div>

            {/* Search & Categories Area */}
            <div className="px-6 sm:px-10 mt-2 space-y-8 shrink-0 relative z-10">
              <div className="relative group">
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keresés az ízek között..."
                  className="w-full bg-white rounded-2xl pl-6 pr-14 py-5 font-bold outline-none border border-zinc-100 shadow-xl shadow-zinc-200/20 focus:ring-4 focus:ring-orange-100/30 transition-all placeholder:text-zinc-300 text-sm"
                />
                <div className="absolute inset-y-0 right-5 flex items-center text-zinc-300 group-focus-within:text-orange-500 transition-colors">
                  <Search size={20} />
                </div>
              </div>

              {/* Swipeable Categories */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none scroll-smooth">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-7 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                      activeCategory === cat 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105' 
                        : 'bg-white text-zinc-400 border border-zinc-100 shadow-sm hover:border-orange-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe List Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-10 py-8 pb-32 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((recipe, idx) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setCompletedSteps([]);
                      }}
                      key={recipe.id}
                      className="relative group bg-white rounded-[32px] overflow-hidden border border-zinc-100/50 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] flex flex-col text-left transition-all hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.12)]"
                    >
                      <div className="h-56 bg-zinc-50 relative overflow-hidden shrink-0">
                         {recipe.image ? (
                           <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" alt={recipe.title} />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-100">
                              <ChefHat size={64} strokeWidth={0.5} />
                           </div>
                         )}
                         <div className="absolute top-4 left-4">
                            <div className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 shadow-xl">
                               {recipe.category}
                            </div>
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-8 relative">
                        <div className="absolute -top-6 right-8 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-orange-600 transition-transform group-hover:-translate-y-1">
                           <Utensils size={20} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors uppercase font-serif italic tracking-tight">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center gap-6 pt-4 border-t border-zinc-50">
                           <div className="flex items-center gap-2 min-w-0">
                             <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                <List size={12} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest truncate">{recipe.ingredients.split('\n').filter(l => l.trim()).length} alapanyag</span>
                           </div>
                           <div className="flex items-center gap-2 min-w-0">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <Target size={12} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest truncate">{recipe.instructions.split('\n').filter(l => l.trim()).length} lépés</span>
                           </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && !loading && (
                   <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                     <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-200 mb-8">
                       <Book size={48} strokeWidth={1} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-300">A receptkönyv még üres</p>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden"
          >
             {/* Detail Scroll Area */}
             <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {/* Visual Header */}
                <div className="relative h-[45vh] sm:h-[55vh] shrink-0">
                   <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
                      {selectedRecipe.image ? (
                        <img src={selectedRecipe.image} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-600/5">
                           <ChefHat size={120} strokeWidth={0.5} className="text-orange-600/10" />
                        </div>
                      )}
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFCFB]" />
                   
                   <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-10">
                     <button 
                       onClick={() => setSelectedRecipe(null)}
                       className="w-12 h-12 bg-white/20 hover:bg-white/40 rounded-2xl text-white backdrop-blur-xl transition-all border border-white/20 flex items-center justify-center active:scale-90"
                     >
                        <ChevronLeft size={24} />
                     </button>
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-2xl">
                        <Sparkles size={16} className="text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Saját Recept</span>
                     </div>
                   </div>
                   
                   <div className="absolute bottom-10 left-8 right-8 z-10">
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-5 py-2.5 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[.3em] inline-block mb-6 shadow-2xl shadow-orange-600/40"
                      >
                        {selectedRecipe.category}
                      </motion.div>
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
                        className="text-5xl sm:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.85] uppercase break-words font-serif italic drop-shadow-sm"
                      >
                        {selectedRecipe.title}
                      </motion.h1>
                   </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 sm:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-40 relative z-10">
                   {/* Ingredients List */}
                   <section className="lg:col-span-5">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
                            <Utensils size={20} />
                         </div>
                         <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-900">
                           Hozzávalók
                         </h2>
                      </div>
                      
                      <div className="space-y-4">
                         {selectedRecipe.ingredients.split('\n').filter(l => l.trim()).map((ing, i) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                              key={i} 
                              className="group flex items-start gap-5 p-5 bg-white rounded-2xl border border-zinc-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md cursor-default"
                            >
                               <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                               <p className="text-zinc-800 font-bold text-lg leading-relaxed flex-1">{ing}</p>
                            </motion.div>
                         ))}
                      </div>
                   </section>

                   {/* Instructions Steps */}
                   <section className="lg:col-span-7">
                      <div className="flex items-center justify-between mb-10">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                               <Sparkles size={20} />
                            </div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-900">
                              Elkészítés
                            </h2>
                         </div>
                         <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                               {completedSteps.length}/{selectedRecipe.instructions.split('\n').filter(l => l.trim()).length} Kész
                            </span>
                         </div>
                      </div>

                      <div className="space-y-6">
                         {selectedRecipe.instructions.split('\n').filter(l => l.trim()).map((step, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                              key={i} 
                              onClick={() => toggleStep(i)}
                              className={`flex gap-8 group cursor-pointer transition-all p-6 rounded-[32px] border ${
                                completedSteps.includes(i) 
                                  ? 'bg-emerald-50/50 border-emerald-100 opacity-40 grayscale' 
                                  : 'bg-white border-zinc-100 hover:border-emerald-200 shadow-sm hover:shadow-xl'
                              }`}
                            >
                               <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                                 completedSteps.includes(i) ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white group-hover:scale-110'
                               }`}>
                                  {completedSteps.includes(i) ? <CheckCircle2 size={24} /> : i + 1}
                               </div>
                               <p className={`pt-2 text-zinc-900 font-bold leading-relaxed text-xl flex-1 transition-all ${completedSteps.includes(i) ? 'line-through text-zinc-400' : ''}`}>
                                 {step}
                               </p>
                            </motion.div>
                         ))}
                      </div>

                      {completedSteps.length === selectedRecipe.instructions.split('\n').filter(l => l.trim()).length && (
                         <motion.div 
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="mt-16 py-12 bg-zinc-900 rounded-[40px] text-center shadow-2xl relative overflow-hidden"
                         >
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '12px 12px' }} />
                            <h3 className="text-white text-4xl font-black tracking-tight mb-2 font-serif italic relative z-10">Jó étvágyat! 👋</h3>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">Tökéletes lett!</p>
                         </motion.div>
                      )}
                   </section>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal - Refined for Mobile */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-md">
            <motion.div 
               initial={{ y: '100%', opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: '100%', opacity: 0 }}
               className="w-full max-w-2xl bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl p-8 sm:p-12 max-h-[92vh] overflow-hidden flex flex-col relative"
            >
               <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-100 rounded-full sm:hidden" />
               
               <div className="flex items-center justify-between mb-8 shrink-0">
                 <div>
                   <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic font-serif">Új Recept</h2>
                   <p className="text-[10px] font-black text-orange-600 tracking-[0.3em] uppercase mt-2">Iratkozz fel az ízekre</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-95 flex items-center justify-center">
                   <X size={24} />
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Az étel fantázianeve</label>
                    <input 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Pl. FIREZEI LASAGNE..."
                      className="w-full bg-zinc-50 rounded-2xl p-6 font-bold outline-none border border-zinc-100 focus:border-orange-500/30 transition-all text-xl shadow-inner italic font-serif"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Válaszd ki a típust</label>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                       {CATEGORIES.slice(1).map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setNewCategory(cat)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                              newCategory === cat 
                                ? 'bg-orange-600 text-white shadow-xl scale-105' 
                                : 'bg-zinc-50 text-zinc-400 border border-zinc-100'
                            }`}
                          >
                             {cat}
                          </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Kép hozzáadása (URL)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center text-zinc-300 group-focus-within:text-orange-500 transition-colors">
                        <ImageIcon size={20} />
                      </div>
                      <input 
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Unsplash vagy más link..."
                        className="w-full bg-zinc-50 rounded-2xl pl-16 pr-8 py-5 font-bold outline-none border border-zinc-100 text-sm shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Hozzávalók</label>
                      <textarea 
                        value={newIngredients}
                        onChange={(e) => setNewIngredients(e.target.value)}
                        placeholder="1 kg hús..."
                        rows={4}
                        className="w-full bg-zinc-50 rounded-2xl p-6 font-bold outline-none border border-zinc-100 resize-none focus:border-orange-500/30 transition-all text-base shadow-inner leading-relaxed"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">Lépések</label>
                      <textarea 
                        value={newInstructions}
                        onChange={(e) => setNewInstructions(e.target.value)}
                        placeholder="1. Pucold meg..."
                        rows={4}
                        className="w-full bg-zinc-50 rounded-2xl p-6 font-bold outline-none border border-zinc-100 resize-none focus:border-orange-500/30 transition-all text-base shadow-inner leading-relaxed"
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-zinc-50 shrink-0">
                  <button 
                    onClick={handleAdd}
                    disabled={!newTitle || !newIngredients || !newInstructions}
                    className="w-full py-8 bg-zinc-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    Recept publikálása
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
