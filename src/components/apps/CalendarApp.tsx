import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Clock, MapPin, AlignLeft, Trash2, 
  Check, X, Calendar as CalendarIcon
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  color: string;
}

interface CalendarAppProps {
  onClose: () => void;
  user: any;
}

const COLORS = [
  'bg-blue-500', 'bg-red-500', 'bg-emerald-500', 
  'bg-amber-500', 'bg-purple-500', 'bg-pink-500'
];

export default function CalendarApp({ onClose, user }: CalendarAppProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [newColor, setNewColor] = useState(COLORS[0]);

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'users', user.uid, 'calendar');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];
      setEvents(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/calendar`);
    });

    return () => unsubscribe();
  }, [user]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('hu-HU', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1));

  const handleAddEvent = async () => {
    if (!newTitle.trim() || !user) return;

    try {
      const eventData = {
        title: newTitle,
        description: newDesc,
        date: selectedDate,
        time: newTime,
        color: newColor,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'users', user.uid, 'calendar'), eventData);
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewTime('12:00');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/calendar`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'calendar', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/calendar/${id}`);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    // Adjusted for Monday start (standard in HU)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20" />);
    }

    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const dayEvents = events.filter(e => e.date === dateStr);

      days.push(
        <motion.button
          key={i}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-20 relative flex flex-col items-center justify-start pt-2 rounded-2xl transition-all ${
            isSelected ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-zinc-100 text-zinc-900'
          }`}
        >
          <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-red-500 ring-1 ring-red-500 px-1.5 rounded-full' : ''}`}>
            {i}
          </span>
          <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-1">
            {dayEvents.slice(0, 3).map((e, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : e.color.replace('bg-', 'bg-')}`} 
              />
            ))}
            {dayEvents.length > 3 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50' : 'bg-zinc-300'}`} />}
          </div>
        </motion.button>
      );
    }

    return days;
  };

  const selectedDayEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden text-zinc-900">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight capitalize">{monthName}</h1>
            <p className="text-xs font-bold text-zinc-400">{year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
            <ChevronLeft size={20} className="text-zinc-400" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
            <ChevronRight size={20} className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-4">
            {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>

        {/* Selected Day Events */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Napi teendők</h2>
            <p className="text-xs font-bold text-zinc-300">{selectedDate.replace(/-/g, '. ')}.</p>
          </div>

          <div className="space-y-3">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map(event => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={event.id}
                  className="bg-zinc-50 rounded-[24px] p-5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${event.color}`} />
                    <div>
                      <h3 className="font-bold text-zinc-900">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-1 opacity-40">
                         {event.time && <div className="text-[10px] font-black flex items-center gap-1"><Clock size={12} /> {event.time}</div>}
                         {event.description && <div className="text-[10px] font-black flex items-center gap-1"><AlignLeft size={12} /> Jegyzet</div>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-3 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon size={24} className="text-zinc-200" />
                </div>
                <p className="text-sm font-bold text-zinc-300">Nincs esemény mára</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-red-500 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-red-500/20 z-50 transition-colors hover:bg-red-600"
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-end p-4 pointer-events-none">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-[40px] shadow-2xl p-8 pb-10 pointer-events-auto ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black tracking-tight">Új esemény</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X size={24} className="text-zinc-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Cím</p>
                  <input 
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Esemény neve"
                    className="w-full bg-zinc-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-red-500/20 transition-all border border-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Időpont</p>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-zinc-50 rounded-2xl p-4 pl-12 font-bold outline-none border border-zinc-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Szín</p>
                    <div className="flex gap-2 h-14 bg-zinc-50 rounded-2xl items-center px-4 border border-zinc-100 overflow-x-auto no-scrollbar">
                      {COLORS.map(c => (
                        <button 
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded-full shrink-0 transition-transform ${c} ${newColor === c ? 'scale-125 ring-2 ring-zinc-900 ring-offset-2' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Leírás (opcionális)</p>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="..."
                    rows={3}
                    className="w-full bg-zinc-50 rounded-2xl p-4 font-bold outline-none border border-zinc-100 resize-none"
                  />
                </div>

                <button 
                  onClick={handleAddEvent}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-500/20 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                >
                  Mentés
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
