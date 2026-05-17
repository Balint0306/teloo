import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Search, Plus, 
  Trash2, Copy, Eye, EyeOff, 
  ShieldCheck, ArrowRight, X,
  ExternalLink, Key, Mail,
  Smartphone, Lock
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

interface PasswordRecord {
  id: string;
  appName: string;
  email: string;
  password: string;
  createdAt: any;
}

interface PasswordsAppProps {
  onClose: () => void;
  user: any;
}

export default function PasswordsApp({ onClose, user }: PasswordsAppProps) {
  const [passwords, setPasswords] = useState<PasswordRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Form
  const [newAppName, setNewAppName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user) return;

    const pwRef = collection(db, 'users', user.uid, 'passwords');
    const q = query(pwRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PasswordRecord[];
      setPasswords(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/passwords`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async () => {
    if (!newAppName || !newEmail || !newPassword || !user) return;

    try {
      const data = {
        appName: newAppName,
        email: newEmail,
        password: newPassword,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'users', user.uid, 'passwords'), data);
      setShowAddModal(false);
      setNewAppName('');
      setNewEmail('');
      setNewPassword('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/passwords`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'passwords', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/passwords/${id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = passwords.filter(p => 
    p.appName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden text-white">
      {/* Header */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 -ml-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Samsung Pass</h1>
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={12} strokeWidth={3} /> Védett kapcsolat
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 mt-6">
        <div className="bg-white/5 border border-white/10 rounded-[32px] flex items-center px-6 py-4 gap-4 shadow-inner">
          <Search size={20} className="text-white/20" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés appok között..."
            className="bg-transparent border-none outline-none font-bold text-sm text-white placeholder:text-white/20 w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-8 mt-10">
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((record) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={record.id}
                className="bg-white/[0.03] border border-white/5 p-7 rounded-[40px] shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Key size={80} />
                </div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                      <Smartphone size={24} className="text-white/60" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{record.appName}</h3>
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest mt-1">Helyi adat</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    className="p-3 text-white/10 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-2xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="bg-black/40 rounded-3xl p-5 flex items-center justify-between group/line border border-white-[0.02]">
                    <div className="flex items-center gap-4">
                      <Mail size={16} className="text-white/20" />
                      <div className="text-sm font-bold text-white/60 truncate max-w-[180px]">{record.email}</div>
                    </div>
                    <button onClick={() => copyToClipboard(record.email)} className="p-2 opacity-0 group-hover/line:opacity-100 transition-opacity hover:text-emerald-500">
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="bg-black/40 rounded-3xl p-5 flex items-center justify-between group/line border border-white-[0.02]">
                    <div className="flex items-center gap-4">
                      <Lock size={16} className="text-white/20" />
                      <div className="text-sm font-mono tracking-widest font-bold">
                        {visiblePasswords[record.id] ? record.password : '••••••••••••'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/line:opacity-100 transition-opacity">
                      <button onClick={() => toggleVisibility(record.id)} className="p-2 hover:text-blue-400">
                        {visiblePasswords[record.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => copyToClipboard(record.password)} className="p-2 hover:text-emerald-500">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
               <ShieldCheck size={80} strokeWidth={1} className="mb-6" />
               <p className="text-sm font-black uppercase tracking-[0.3em]">Nincs találat</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 w-16 h-16 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 z-50 transition-all border border-emerald-400/20"
      >
        <Plus size={32} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[48px] p-10 relative overflow-hidden"
             >
                <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>

                <h2 className="text-2xl font-black mb-10 tracking-tight">Hozzáadás</h2>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2">Alkalmazás neve</label>
                      <input 
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="pl. Facebook, Google..."
                        className="w-full bg-white/5 rounded-3xl p-5 font-bold outline-none border border-white/5 focus:border-emerald-500/50 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2">E-mail / Felhasználónév</label>
                      <input 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="valaki@example.com"
                        className="w-full bg-white/5 rounded-3xl p-5 font-bold outline-none border border-white/5 focus:border-emerald-500/50 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2">Jelszó</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 rounded-3xl p-5 font-bold font-mono outline-none border border-white/5 focus:border-emerald-500/50 transition-all"
                      />
                   </div>

                   <button 
                    onClick={handleAdd}
                    className="w-full py-5 bg-emerald-600 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 mt-4 active:scale-95 transition-all"
                   >
                     Megerősítés
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
