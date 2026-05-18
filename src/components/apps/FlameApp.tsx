import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, X, Heart, ShieldCheck, 
  RotateCw, Dices, Users, Settings, 
  Sparkles, Zap, ChevronRight, Lock
} from 'lucide-react';
import { FLAME_CONTENT } from './flameContent';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const VISUAL_WHEEL_LABELS = [
  "VÁGY", "NYALÁS", "SZOPÁS", "DUGÁS", "BŰNÖS", "MOCSOK", 
  "MÁMOR", "TŰZ", "EXTRÉM", "LÁZ", "SZORGOS", "JÁTÉK",
  "VÁGY", "NYALÁS", "SZOPÁS", "DUGÁS", "BŰNÖS", "MOCSOK", 
  "MÁMOR", "TŰZ", "EXTRÉM", "LÁZ", "SZORGOS", "JÁTÉK",
  "VÁGY", "NYALÁS", "SZOPÁS", "DUGÁS", "BŰNÖS", "MOCSOK", 
  "MÁMOR", "TŰZ", "EXTRÉM", "LÁZ", "SZORGOS", "JÁTÉK"
];

const FlameApp = ({ onClose, user, profile }: { onClose: () => void; user: any; profile: any }) => {
  const [is18Verified, setIs18Verified] = useState(profile?.settings?.is18Verified || false);
  const [activeTab, setActiveTab] = useState<'wheel' | 'cards' | 'settings'>('wheel');
  const [spiciness, setSpiciness] = useState<'extreme'>('extreme');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  
  const [activeDeck, setActiveDeck] = useState<typeof FLAME_CONTENT.decks[0] | null>(null);
  const [currentCardContent, setCurrentCardContent] = useState<string | null>(null);
  const [playerGenders, setPlayerGenders] = useState<{ 'Partner A': 'male' | 'female'; 'Partner B': 'male' | 'female' }>({
    'Partner A': 'male',
    'Partner B': 'female'
  });
  const [currentPlayer, setCurrentPlayer] = useState<'Partner A' | 'Partner B'>('Partner A');

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelResult(null);
    
    const randomRotation = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      // Pick a truly random task from the full database regardless of visual slice
      const gender = playerGenders[currentPlayer];
      const actualContent = (FLAME_CONTENT.wheel[spiciness] as any)?.[gender] || [];
      if (actualContent.length === 0) {
        setWheelResult("Nincs elérhető feladat.");
        return;
      }
      const randomIndex = Math.floor(Math.random() * actualContent.length);
      setWheelResult(actualContent[randomIndex]);
    }, 3000);
  };

  const drawCard = (deck: typeof FLAME_CONTENT.decks[0]) => {
    setActiveDeck(deck);
    const gender = playerGenders[currentPlayer];
    const options = (deck.content[spiciness] as any)?.[gender] || [];
    if (options.length === 0) {
      setCurrentCardContent("Ehhez a szinthez nincs elérhető kártya.");
      return;
    }
    const randomLabel = options[Math.floor(Math.random() * options.length)];
    setCurrentCardContent(randomLabel);
  };

  const toggleGender = (player: 'Partner A' | 'Partner B') => {
    setPlayerGenders(prev => ({
      ...prev,
      [player]: prev[player] === 'male' ? 'female' : 'male'
    }));
  };

  const togglePlayer = () => {
    setCurrentPlayer(prev => prev === 'Partner A' ? 'Partner B' : 'Partner A');
  };

  const handleVerify = async () => {
    setIs18Verified(true);
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'settings.is18Verified': true,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating 18+ verification:", error);
      }
    }
  };

  if (!is18Verified) {
    return (
      <div className="h-full bg-black text-white flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_top,rgba(225,29,72,0.15),transparent)]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/20"
        >
          <Flame size={40} className="text-white" />
        </motion.div>
        <h1 className="text-3xl font-black mb-4 tracking-tighter italic uppercase underline decoration-rose-500 decoration-4 underline-offset-8">Flame: Páros Játék</h1>
        <p className="text-zinc-400 text-sm mb-12 leading-relaxed max-w-xs">
          Ez az alkalmazás felnőtt tartalmat és játékos feladatokat tartalmaz. A belépéshez megerősíted, hogy elmúltál 18 éves.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button 
            onClick={handleVerify}
            className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-500/30"
          >
            Igen, elmúltam 18
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-zinc-900 text-zinc-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            Inkább kilépek
          </button>
        </div>
        <div className="mt-12 flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <ShieldCheck size={14} />
          Biztonságos & Privát
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-rose-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      {/* HEADER */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <Flame size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter italic text-rose-500">Flame</span>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={togglePlayer}
             className="px-4 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white"
           >
             <Users size={14} className="text-rose-500" />
             {currentPlayer}
             <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-rose-400">
               {playerGenders[currentPlayer] === 'male' ? 'FÉRFI' : 'NŐ'}
             </span>
           </button>
           <button 
             onClick={() => toggleGender(currentPlayer)}
             className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors"
             title="Nem váltása"
           >
             <RotateCw size={14} />
           </button>
           <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
            <X size={18} />
           </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 bg-white/5 mx-6 p-1 rounded-2xl border border-white/5 z-20 shrink-0">
        <button 
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wheel' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          <RotateCw size={14} className="mx-auto mb-1" />
          Kerék
        </button>
        <button 
          onClick={() => setActiveTab('cards')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cards' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          <Dices size={14} className="mx-auto mb-1" />
          Kártyák
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-rose-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          <Settings size={14} className="mx-auto mb-1" />
          Saját
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'wheel' && (
            <motion.div 
              key="wheel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-6 flex flex-col items-center justify-center h-full min-h-[500px]"
            >
              <div className="relative mb-12">
                {/* WHEEL POINTER */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -top-4 z-40 text-rose-500 scale-150">
                  <Flame fill="currentColor" />
                </div>
                
                {/* THE WHEEL */}
                <motion.div 
                   animate={{ rotate: rotation }}
                   transition={{ duration: isSpinning ? 3 : 0, ease: [0.15, 0, 0.15, 1] }}
                   className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-[10px] border-zinc-900 shadow-[0_0_50px_rgba(244,63,94,0.2)] relative overflow-hidden bg-zinc-900"
                >
                  {VISUAL_WHEEL_LABELS.map((option, i) => (
                    <div 
                      key={i}
                      className="absolute top-0 left-1/2 origin-bottom h-1/2 flex items-start justify-center pt-4"
                      style={{ 
                        width: '30px',
                        marginLeft: '-15px',
                        transform: `rotate(${i * (360 / VISUAL_WHEEL_LABELS.length)}deg)` 
                      }}
                    >
                      <span className="text-[6px] font-black uppercase tracking-[0.2em] text-zinc-500 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        {option}
                      </span>
                    </div>
                  ))}
                  {/* CENTRAL HUB */}
                  <div className="absolute inset-0 m-auto w-14 h-14 bg-black border-4 border-rose-500 rounded-full z-10 flex items-center justify-center shadow-2xl shadow-rose-500/50">
                    <Flame size={24} className="text-rose-500 fill-rose-500" />
                  </div>
                  {/* SECTIONS DIVIDERS */}
                  {VISUAL_WHEEL_LABELS.map((_, i) => (
                    <div 
                      key={`div-${i}`}
                      className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-white/10 origin-bottom"
                      style={{ transform: `rotate(${(i * (360 / VISUAL_WHEEL_LABELS.length)) + (360 / VISUAL_WHEEL_LABELS.length / 2)}deg)` }}
                    />
                  ))}
                </motion.div>
              </div>

              {wheelResult && !isSpinning && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 text-center px-4"
                >
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">A feladatod:</p>
                  <h3 className="text-2xl font-black italic tracking-tight text-white uppercase">{wheelResult}</h3>
                </motion.div>
              )}

              <button 
                onClick={spinWheel}
                disabled={isSpinning}
                className="w-full max-w-[240px] py-6 bg-gradient-to-r from-rose-600 to-orange-600 rounded-[30px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSpinning ? "PÖRGÉS..." : "PÖRGETÉS"}
              </button>
            </motion.div>
          )}

          {activeTab === 'cards' && (
            <motion.div 
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {FLAME_CONTENT.decks.map((deck) => (
                  <motion.div 
                    key={deck.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => drawCard(deck as any)}
                    className={`p-6 rounded-[32px] bg-gradient-to-br ${deck.color} shadow-xl relative overflow-hidden group cursor-pointer`}
                  >
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                        {deck.icon === 'Heart' ? <Heart size={24} className="text-white" /> : 
                         deck.icon === 'Zap' ? <Zap size={24} className="text-white" /> : 
                         <Sparkles size={24} className="text-white" />}
                      </div>
                      <h3 className="text-2xl font-black italic">{deck.name}</h3>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{((deck.content[spiciness] as any)[playerGenders[currentPlayer]]?.length || 0)} feladat érhető el</p>
                    </div>
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      {deck.icon === 'Heart' ? <Heart size={80} strokeWidth={1} /> : 
                       deck.icon === 'Zap' ? <Zap size={80} strokeWidth={1} /> : 
                       <Sparkles size={80} strokeWidth={1} />}
                    </div>
                    <div className="absolute bottom-4 right-6 text-white/50">
                      <ChevronRight size={24} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 flex flex-col items-center justify-center h-full pt-10"
            >
               <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-500 mb-6 border border-white/5">
                 <Lock size={32} />
               </div>
               <h2 className="text-xl font-black italic tracking-tight mb-2 uppercase">Prémium Tartalom</h2>
               <p className="text-center text-zinc-500 text-xs font-medium max-w-[240px] leading-relaxed mb-10">
                 Adj hozzá saját feladatokat és testreszabott kártyákat a prémium csomaggal.
               </p>
               <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                 Vásárlás folytatása
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CARD MODAL */}
      <AnimatePresence>
        {activeDeck && currentCardContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.8, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className={`w-full max-w-sm aspect-[3/4] bg-gradient-to-br ${activeDeck.color} rounded-[40px] shadow-2xl p-10 flex flex-col items-center justify-between text-center relative overflow-hidden border border-white/20`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                {activeDeck.icon === 'Heart' ? <Heart size={32} className="text-white" /> : 
                 activeDeck.icon === 'Zap' ? <Zap size={32} className="text-white" /> : 
                 <Sparkles size={32} className="text-white" />}
              </div>
              
              <div className="space-y-4">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{activeDeck.name} kártya</p>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-tight">{currentCardContent}</h2>
              </div>

              <button 
                onClick={() => {
                  setActiveDeck(null);
                  setCurrentCardContent(null);
                  togglePlayer();
                }}
                className="w-full py-5 bg-white text-black rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                KÉSZ, KÖVETKEZŐ
              </button>

              <div className="absolute top-0 right-0 p-8 opacity-10">
                {activeDeck.icon === 'Heart' ? <Heart size={120} strokeWidth={1} /> : 
                 activeDeck.icon === 'Zap' ? <Zap size={120} strokeWidth={1} /> : 
                 <Sparkles size={120} strokeWidth={1} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default FlameApp;

