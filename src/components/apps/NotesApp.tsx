import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Trash2, ChevronLeft, 
  FileText, Save, Clock, StickyNote,
  Check, AlertCircle
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  color: string;
}

const COLORS = [
  'bg-amber-100 text-amber-900 border-amber-200',
  'bg-blue-100 text-blue-900 border-blue-200',
  'bg-green-100 text-green-900 border-green-200',
  'bg-rose-100 text-rose-900 border-rose-200',
  'bg-purple-100 text-purple-900 border-purple-200',
  'bg-zinc-100 text-zinc-900 border-zinc-200',
];

const NotesApp = ({ onClose, user }: { onClose: () => void, user: User | null }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(fetchedNotes);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/notes`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddNote = async () => {
    if (!user) return;
    try {
      const newNote = {
        title: 'Új jegyzet',
        content: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      setSelectedNote({ id: docRef.id, ...newNote });
      setIsEditing(true);
      setEditTitle('Új jegyzet');
      setEditContent('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/notes`);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedNote) return;
    setSaveStatus('saving');
    try {
      const notePath = `users/${user.uid}/notes/${selectedNote.id}`;
      const noteRef = doc(db, notePath);
      await updateDoc(noteRef, {
        title: editTitle || 'Cím nélkül',
        content: editContent,
        updatedAt: Timestamp.now(),
      });
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setSelectedNote(null);
      }, 800);
    } catch (error) {
      setSaveStatus('error');
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/notes/${selectedNote.id}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = async (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return;
    
    try {
      const notePath = `users/${user.uid}/notes/${noteId}`;
      await deleteDoc(doc(db, notePath));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-all">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Jegyzetek</h1>
          </div>
          <button 
            onClick={handleAddNote}
            className="w-10 h-10 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Keresés a jegyzetek között..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 border-none rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        <AnimatePresence>
          {loading ? (
            <div className="flex items-center justify-center pt-20">
              <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-zinc-400 opacity-60">
              <StickyNote size={64} strokeWidth={1} className="mb-4" />
              <p className="font-medium">Nincsenek jegyzetek</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layoutId={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                    setEditTitle(note.title);
                    setEditContent(note.content);
                  }}
                  className={`${note.color} p-5 rounded-3xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col h-44 relative group`}
                >
                  <h3 className="font-bold text-base mb-2 line-clamp-1">{note.title || 'Cím nélkül'}</h3>
                  <p className="text-xs opacity-70 line-clamp-5 flex-1">{note.content || 'Nincs tartalom...'}</p>
                  <div className="mt-3 flex items-center gap-1.5 opacity-40">
                    <Clock size={10} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {note.updatedAt?.toDate?.() ? new Date(note.updatedAt.toDate()).toLocaleDateString('hu-HU') : 'Most'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(note.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-900/40 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>

                  {showDeleteConfirm === note.id && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
                      <p className="text-sm font-bold text-zinc-900 mb-4">Biztosan törlöd?</p>
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          className="flex-1 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-600"
                        >
                          Mégse
                        </button>
                        <button 
                          onClick={(e) => handleDelete(note.id, e)}
                          className="flex-1 py-2 bg-red-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-500/20"
                        >
                          Törlés
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Note Editor Overlay */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] ${selectedNote.color.split(' ')[0]} flex flex-col`}
          >
            <div className="pt-12 px-6 pb-4 flex items-center justify-between">
              <button 
                onClick={() => setSelectedNote(null)}
                className="p-2 -ml-2 text-zinc-900/60 hover:text-zinc-900 transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(selectedNote.id)}
                  className="p-2.5 bg-zinc-900/5 hover:bg-red-500/10 rounded-2xl text-zinc-900/40 hover:text-red-600 transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saveStatus !== 'idle'}
                  className={`p-2.5 px-5 rounded-2xl text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 min-w-[110px] justify-center ${
                    saveStatus === 'success' ? 'bg-green-500 shadow-green-500/20' : 
                    saveStatus === 'error' ? 'bg-red-500 shadow-red-500/20' : 
                    'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saveStatus === 'success' ? (
                    <Check size={20} />
                  ) : saveStatus === 'error' ? (
                    <AlertCircle size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  <span className="text-sm font-bold">
                    {saveStatus === 'saving' ? 'Mentés...' : 
                     saveStatus === 'success' ? 'Mentve!' : 
                     saveStatus === 'error' ? 'Hiba' : 'Mentés'}
                  </span>
                </button>
              </div>

              {showDeleteConfirm === selectedNote.id && (
                <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-8">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Trash2 size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">Jegyzet törlése</h2>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                      Biztosan törölni szeretnéd ezt a jegyzetet? Ez a művelet nem vonható vissza.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleDelete(selectedNote.id)}
                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
                      >
                        Törlés megerősítése
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(null)}
                        className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-bold transition-all active:scale-95"
                      >
                        Mégse
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col px-8 pb-10">
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Cím"
                className="bg-transparent border-none outline-none text-3xl font-black placeholder:opacity-20 mb-6 text-zinc-900"
              />
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Írj ide valamit..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:opacity-20 text-zinc-900/80"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesApp;
