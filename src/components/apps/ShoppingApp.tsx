import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Plus, Trash2, Trash,
  CheckCircle2, ShoppingCart, 
  X, PlusCircle, Sparkles, Hash, Layers,
  Activity, ArrowRight, ListTodo
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

interface ShoppingList {
  id: string;
  name: string;
  createdAt: any;
}

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  completed: boolean;
  createdAt: any;
}

interface ShoppingAppProps {
  onClose: () => void;
  user: any;
}

export default function ShoppingApp({ onClose, user }: ShoppingAppProps) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showListDeleteConfirm, setShowListDeleteConfirm] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  useEffect(() => {
    if (!user) return;

    const listsRef = collection(db, 'users', user.uid, 'shoppingLists');
    const q = query(listsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ShoppingList[];
      setLists(docs);
      if (docs.length > 0 && !activeListId) {
        setActiveListId(docs[0].id);
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/shoppingLists`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !activeListId) {
      setItems([]);
      return;
    }

    const itemsRef = collection(db, 'users', user.uid, 'shoppingLists', activeListId, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ShoppingItem[];
      setItems(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/shoppingLists/${activeListId}/items`);
    });

    return () => unsubscribe();
  }, [user, activeListId]);

  const handleAddList = async () => {
    if (!user || !newListName.trim()) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'shoppingLists'), {
        name: newListName,
        createdAt: Timestamp.now()
      });
      setNewListName('');
      setShowAddListModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/shoppingLists`);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputValue.trim() || !activeListId) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'shoppingLists', activeListId, 'items'), {
        name: inputValue,
        amount: amountValue || '1',
        completed: false,
        createdAt: Timestamp.now()
      });
      setInputValue('');
      setAmountValue('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/shoppingLists/${activeListId}/items`);
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    if (!activeListId || !user) return;
    try {
      const itemRef = doc(db, 'users', user.uid, 'shoppingLists', activeListId, 'items', item.id);
      await updateDoc(itemRef, {
        completed: !item.completed
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/shoppingLists/${activeListId}/items/${item.id}`);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!activeListId || !user || !itemId) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'shoppingLists', activeListId, 'items', itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/shoppingLists/${activeListId}/items/${itemId}`);
    }
  };

  const handleDeleteListConfirmed = async () => {
    if (!user || !showListDeleteConfirm) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'shoppingLists', showListDeleteConfirm));
      if (activeListId === showListDeleteConfirm) {
        const remaining = lists.filter(l => l.id !== showListDeleteConfirm);
        setActiveListId(remaining.length > 0 ? remaining[0].id : null);
      }
      setShowListDeleteConfirm(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/shoppingLists/${showListDeleteConfirm}`);
    }
  };

  const handleClearCompleted = async () => {
    if (!activeListId || !user) return;
    const completedItems = items.filter(i => i.completed);
    for (const item of completedItems) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'shoppingLists', activeListId, 'items', item.id));
      } catch (error) {
        console.error('Error clearing:', error);
      }
    }
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-[#1C1C1E] font-sans w-full max-w-full relative selection:bg-indigo-100">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] -mr-[10vw] -mt-[10vw] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-violet-500/5 rounded-full blur-[80px] -ml-[10vw] -mb-[10vw] pointer-events-none" />

      {/* ERROR FEEDBACK */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 bg-zinc-900 text-white rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs border border-white/10 backdrop-blur-md"
          >
            <Activity size={16} className="text-red-400" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="pt-16 sm:pt-20 px-6 sm:px-10 pb-6 shrink-0 relative z-30">
        <div className="flex items-center justify-between gap-4 mb-8">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Rendszer v3.1</span>
          </div>

          <button 
            onClick={() => setShowAddListModal(true)}
            className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-indigo-600"
          >
            <Plus size={20} />
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter text-zinc-900 leading-[1] max-w-full truncate px-1">
          Bevásárló Lista
        </h1>

        {/* LIST SELECTOR (Horizontal Bento) */}
        <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {lists.map((list, idx) => (
            <motion.button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`relative shrink-0 px-6 py-4 rounded-3xl border-2 transition-all duration-300 flex items-center gap-4 ${
                activeListId === list.id 
                  ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-500/10' 
                  : 'bg-zinc-50 border-transparent hover:border-zinc-200'
              }`}
            >
              <div className="flex flex-col items-start leading-none">
                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${activeListId === list.id ? 'text-indigo-500' : 'text-zinc-300'}`}>
                  LISTA-{idx + 1}
                </span>
                <span className={`text-sm font-bold whitespace-nowrap ${activeListId === list.id ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {list.name}
                </span>
              </div>
              
              {activeListId === list.id && (
                <div 
                  onClick={(e) => { e.stopPropagation(); setShowListDeleteConfirm(list.id); }}
                  className="p-1.5 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={14} />
                </div>
              )}
            </motion.button>
          ))}
          {lists.length === 0 && !loading && (
             <button 
               onClick={() => setShowAddListModal(true)}
               className="shrink-0 px-6 py-4 rounded-3xl border-2 border-dashed border-zinc-200 text-zinc-300 hover:border-indigo-200 hover:text-indigo-500 transition-all text-xs font-bold"
             >
               + Új lista
             </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 pb-8 relative z-20">
        <div className="flex-1 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col overflow-hidden relative">
          {activeListId ? (
            <>
              {/* LIST HEADER */}
              <div className="px-4 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-zinc-50/50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 truncate max-w-[200px] sm:max-w-none">
                    {lists.find(l => l.id === activeListId)?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Tételek listája</span>
                    <div className="w-0.5 h-0.5 rounded-full bg-zinc-200" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">{items.length} tétel</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                  <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
                    <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-indigo-500" 
                        initial={{ width: 0 }}
                        animate={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap">{completedCount}/{items.length} KÉSZ</span>
                  </div>
                  {completedCount > 0 && (
                    <button 
                      onClick={handleClearCompleted}
                      className="w-9 h-9 bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center shrink-0"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* INPUT MODULE */}
              <div className="px-4 sm:px-8 py-4 sticky top-[80px] sm:top-[76px] bg-white/40 backdrop-blur-sm z-10 border-b border-zinc-50">
                <form 
                  onSubmit={handleAdd}
                  className="bg-zinc-50 p-1.5 sm:p-2 rounded-2xl flex items-center gap-1 border border-zinc-100 focus-within:border-indigo-100 focus-within:bg-white focus-within:shadow-lg transition-all"
                >
                  <div className="flex-1 flex items-center px-2 sm:px-4 gap-2 sm:gap-4 overflow-hidden">
                    <ShoppingCart size={16} className="text-zinc-300 shrink-0" />
                    <input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Mit vegyünk?"
                      className="flex-1 bg-transparent outline-none font-bold text-xs sm:text-sm placeholder:text-zinc-300 py-2 sm:py-3 min-w-0"
                    />
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-zinc-200" />
                  <div className="flex items-center gap-1 px-1 sm:px-3">
                    <input 
                      type="number"
                      min="1"
                      value={amountValue}
                      onChange={(e) => setAmountValue(e.target.value)}
                      placeholder="1"
                      className="w-8 sm:w-10 bg-transparent outline-none font-black text-xs sm:text-sm text-center text-indigo-600 placeholder:text-zinc-300"
                    />
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest hidden sm:inline">db</span>
                  </div>
                  <button 
                    disabled={!inputValue.trim()}
                    className="h-8 sm:h-10 px-4 sm:px-6 bg-zinc-900 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-95 disabled:opacity-20 transition-all flex items-center gap-2 shrink-0"
                  >
                    <span className="hidden sm:inline">Hozzáadás</span>
                    <Plus size={14} className="sm:hidden" />
                    <ArrowRight size={14} className="hidden sm:inline" />
                  </button>
                </form>
              </div>

              {/* ITEMS FEED */}
              <div className={`flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 ${items.length > 0 ? 'pb-20' : 'pb-0'}`}>
                <div className="space-y-2 py-4">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.map((item, idx) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.01 } }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.id}
                        className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                          item.completed 
                            ? 'bg-zinc-50 border-transparent opacity-60' 
                            : 'bg-white border-zinc-100 hover:shadow-md hover:border-indigo-100'
                        }`}
                        onClick={() => handleToggle(item)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all ${
                            item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-50 border-zinc-100 text-transparent'
                          }`}>
                            <CheckCircle2 size={14} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-xs sm:text-sm tracking-tight truncate transition-all ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className={`px-1.5 py-0.5 rounded-lg text-[7px] sm:text-[8px] font-black uppercase bg-zinc-100 text-zinc-400`}>
                                 {item.amount} db
                               </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {items.length === 0 && !loading && (
                    <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center opacity-30 select-none">
                       <ShoppingCart size={32} strokeWidth={1} className="mb-3" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">A lista üres</h3>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-8 border border-zinc-100 shadow-inner">
                <Hash size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tighter">Inicializálás szükséges</h3>
              <p className="text-xs text-zinc-400 max-w-[200px] leading-relaxed mb-8">Válassz egy listát vagy hozz létre egy újat a kezdéshez.</p>
              
              <button 
                onClick={() => setShowAddListModal(true)}
                className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-xs shadow-xl active:scale-95 transition-all hover:bg-indigo-600 flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Új lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddListModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddListModal(false)} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[40px] p-8 sm:p-12 w-full max-w-sm shadow-2xl relative overflow-hidden z-[510] border border-zinc-100">
              <div className="text-center mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">Új kategória</p>
                <h2 className="text-2xl font-bold tracking-tighter">Lista létrehozása</h2>
              </div>
              <div className="space-y-6">
                <input 
                  autoFocus 
                  value={newListName} 
                  onChange={(e) => setNewListName(e.target.value)} 
                  placeholder="Lista neve..." 
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 font-bold text-lg text-zinc-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all placeholder:text-zinc-200" 
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowAddListModal(false)} className="flex-1 py-4 bg-zinc-50 rounded-2xl font-bold text-xs text-zinc-400 hover:bg-zinc-100 transition-all">Mégse</button>
                  <button onClick={handleAddList} disabled={!newListName.trim()} className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold text-xs shadow-xl active:scale-95 transition-all disabled:opacity-20 hover:bg-indigo-600">Létrehozás</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showListDeleteConfirm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowListDeleteConfirm(null)} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-10 w-full max-w-xs shadow-2xl z-[610] text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold mb-3 tracking-tighter">Töröljük a listát?</h2>
              <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">Ez a lista és az összes hozzá tartozó tétel véglegesen törlésre kerül.</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleDeleteListConfirmed} className="py-4 bg-red-600 text-white rounded-2xl font-bold text-xs shadow-lg active:scale-95 hover:bg-red-700 transition-all">Törlés végrehajtása</button>
                <button onClick={() => setShowListDeleteConfirm(null)} className="py-4 bg-zinc-50 text-zinc-400 rounded-2xl font-bold text-xs hover:bg-zinc-100 transition-all">Megszakítás</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </div>
  );
}
