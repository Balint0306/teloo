import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Search, Library, Play, Pause, SkipForward, 
  SkipBack, Repeat, Shuffle, Heart, MoreHorizontal,
  ChevronDown, Search as SearchIcon, ListMusic, Music,
  Settings, Clock, Bell, Plus, Pin, Volume2, Maximize2,
  Tv, Monitor, Smartphone, Laptop, Speaker, Share2
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { SPOTIFY_TRACKS, type Track } from './spotifyContent';

const SpotifyLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.508 17.301c-.216.354-.675.465-1.028.249-2.85-1.743-6.438-2.136-10.662-1.17-.405.093-.81-.159-.903-.564-.093-.405.159-.81.564-.903 4.62-1.056 8.583-.606 11.778 1.347.351.216.462.675.251 1.041zm1.467-3.261c-.273.444-.852.585-1.296.312-3.261-2-8.232-2.583-12.087-1.413-.501.153-1.026-.135-1.179-.636-.153-.501.135-1.026.636-1.179 4.416-1.341 9.9-0.672 13.62 1.62.441.27.585.852.306 1.296zm.138-3.411c-3.909-2.322-10.353-2.535-14.127-1.389-.6.183-1.236-.162-1.419-.762-.183-.6.162-1.236.762-1.419 4.317-1.311 11.451-1.065 16.002 1.638.54.321.717 1.02.396 1.56-.321.54-1.02.717-1.563.396l-.551-.324z"/>
  </svg>
);

const SpotifyApp = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(SPOTIFY_TRACKS[0]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Bálint');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedTracks, setLikedTracks] = useState<number[]>([1, 2]);
  const [showDevices, setShowDevices] = useState(false);
  const [deviceId] = useState(() => Math.random().toString(36).substring(7));
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isUpdatingFromFirebase = useRef(false);

  // Sync with Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const playbackRef = doc(db, `users/${auth.currentUser.uid}/spotify/playback`);
    const devicesRef = doc(db, `users/${auth.currentUser.uid}/spotifyDevices/${deviceId}`);

    // Register this device
    setDoc(devicesRef, {
      id: deviceId,
      name: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? `${userName} telefonja` : `${userName} gépe`,
      type: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'smartphone' : 'computer',
      lastActive: serverTimestamp()
    });

    // Listen for playback changes
    const unsubPlayback = onSnapshot(playbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // If the playback state is being controlled by another device
        if (data.activeDeviceId !== deviceId) {
          isUpdatingFromFirebase.current = true;
          const track = SPOTIFY_TRACKS.find(t => t.id === data.trackId);
          if (track) setCurrentTrack(track);
          setIsPlaying(data.isPlaying);
          
          if (videoRef.current && Math.abs(videoRef.current.currentTime - data.currentTime) > 3) {
            videoRef.current.currentTime = data.currentTime;
          }
          setActiveDeviceId(data.activeDeviceId);
          setTimeout(() => { isUpdatingFromFirebase.current = false; }, 200);
        } else {
          setActiveDeviceId(deviceId);
        }
      }
    });

    return () => unsubPlayback();
  }, [deviceId, userName]);

  // Update Firebase when local state changes
  const updateFirebasePlayback = async (updates: any) => {
    if (isUpdatingFromFirebase.current || !auth.currentUser) return;
    const playbackRef = doc(db, `users/${auth.currentUser.uid}/spotify/playback`);
    try {
      await setDoc(playbackRef, {
        trackId: currentTrack.id,
        isPlaying,
        currentTime: videoRef.current?.currentTime || 0,
        activeDeviceId: activeDeviceId || deviceId,
        updatedAt: serverTimestamp(),
        ...updates
      }, { merge: true });
    } catch (e) {
      console.error("Error updating playback:", e);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let g = '';
    if (hour >= 5 && hour < 12) g = 'Jó reggelt';
    else if (hour >= 12 && hour < 18) g = 'Jó napot';
    else if (hour >= 18 && hour < 22) g = 'Jó estét';
    else g = 'Szép estét';
    setGreeting(g);

    if (auth.currentUser?.displayName) {
      setUserName(auth.currentUser.displayName.split(' ')[0]);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      videoRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
      if (videoRef.current.ended) {
        handleNext();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    const currentIndex = SPOTIFY_TRACKS.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % SPOTIFY_TRACKS.length;
    const nextTrack = SPOTIFY_TRACKS[nextIndex];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    updateFirebasePlayback({ trackId: nextTrack.id, isPlaying: true, currentTime: 0 });
  };

  const handlePrev = () => {
    const currentIndex = SPOTIFY_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + SPOTIFY_TRACKS.length) % SPOTIFY_TRACKS.length;
    const prevTrack = SPOTIFY_TRACKS[prevIndex];
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    updateFirebasePlayback({ trackId: prevTrack.id, isPlaying: true, currentTime: 0 });
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newState = !isPlaying;
    setIsPlaying(newState);
    updateFirebasePlayback({ isPlaying: newState, activeDeviceId: deviceId });
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col bg-black font-sans text-white overflow-hidden relative selection:bg-[#1DB954]/30">
      {/* Hidden Video Engine */}
      <video 
        ref={videoRef}
        src={currentTrack.videoUrl}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
        playsInline
      />

      {/* Dynamic Background */}
      <div className="absolute inset-x-0 top-0 h-[300px] w-full z-0 overflow-hidden opacity-30 pointer-events-none">
        <motion.div 
          animate={{ backgroundColor: [currentTrack.color, '#000000'] }}
          transition={{ duration: 1.5 }}
          className="w-full h-full blur-[100px]"
        />
      </div>

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {!isPlayerExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-12 px-6 pb-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SpotifyLogo className="w-8 h-8 text-[#1DB954]" />
                <h1 className="text-2xl font-black tracking-tight">{greeting}</h1>
              </div>
              <div className="flex gap-5 text-zinc-400">
                <button className="hover:text-white transition-colors"><Bell size={22} /></button>
                <button className="hover:text-white transition-colors"><Clock size={22} /></button>
                <button className="hover:text-white transition-colors" onClick={onClose}><Settings size={22} /></button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-32">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-5 mb-8">
                <div className="grid grid-cols-2 gap-2">
                  {SPOTIFY_TRACKS.slice(0, 6).map((track, i) => (
                    <motion.div 
                      key={track.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                      }}
                      className="bg-zinc-900/40 rounded-md overflow-hidden flex items-center gap-3 backdrop-blur-xl group cursor-pointer hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                    >
                      <img src={track.cover} className="w-14 h-14 object-cover shadow-lg" alt={track.title} />
                      <div className="text-[11px] font-bold tracking-tight line-clamp-2 pr-2">{track.title}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <section className="mb-10">
                <h2 className="px-5 text-xl font-black mb-4 tracking-tighter">Legutóbb játszott</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-4">
                  {SPOTIFY_TRACKS.map((track, i) => (
                    <motion.div 
                      key={track.id} 
                      className="min-w-[155px] flex flex-col group cursor-pointer active:scale-95 transition-transform"
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="w-[155px] h-[155px] rounded-xl overflow-hidden shadow-2xl mb-3 relative">
                        <img src={track.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={track.title} />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                        
                        {currentTrack.id === track.id && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="flex gap-1.5 items-end h-8">
                               <motion.div animate={{ height: isPlaying ? [12, 32, 12] : 4 }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-[#1DB954] rounded-full" />
                               <motion.div animate={{ height: isPlaying ? [20, 8, 32, 20] : 6 }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-[#1DB954] rounded-full" />
                               <motion.div animate={{ height: isPlaying ? [32, 12, 32] : 4 }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-[#1DB954] rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-[13px] font-bold mb-0.5 truncate tracking-tight">{track.title}</div>
                      <div className="text-[11px] text-zinc-500 font-bold tracking-tight">{track.artist}</div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <div className="px-5 pb-20">
              <h2 className="text-3xl font-black mb-6 tracking-tighter">Keresés</h2>
              <div className="relative mb-8">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  autoFocus
                  placeholder="Művész, dal vagy podcast"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-zinc-900 h-12 rounded-lg pl-12 pr-4 font-bold outline-none ring-0 border-none"
                />
              </div>

              {searchQuery.trim() !== '' && (
                <div className="space-y-4">
                  {SPOTIFY_TRACKS.filter(t => 
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(track => (
                    <div 
                      key={track.id} 
                      onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                      className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 cursor-pointer group active:scale-[0.98] transition-all"
                    >
                      <img src={track.cover} className="w-12 h-12 rounded object-cover shadow-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{track.title}</div>
                        <div className="text-xs text-zinc-500 font-bold truncate">{track.artist}</div>
                      </div>
                      <Heart 
                        size={18} 
                        className={likedTracks.includes(track.id) ? 'text-[#1DB954]' : 'text-zinc-600'} 
                        fill={likedTracks.includes(track.id) ? '#1DB954' : 'none'}
                      />
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim() === '' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Pop', 'Rock', 'Hip-Hop', 'Indie', 'Workout', 'Hungarian'].map((cat, i) => (
                    <div key={cat} className={`h-24 rounded-lg p-3 relative overflow-hidden bg-gradient-to-br transition-all cursor-pointer hover:brightness-110 ${
                      i % 3 === 0 ? 'from-purple-600 to-indigo-800' : 
                      i % 3 === 1 ? 'from-emerald-600 to-teal-800' : 'from-rose-600 to-pink-800'
                    }`}>
                      <span className="font-bold text-lg tracking-tight relative z-10">{cat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="px-5 pb-20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">B</div>
                    <h2 className="text-2xl font-black tracking-tighter">Saját Tár</h2>
                  </div>
                  <button className="text-zinc-400"><Plus size={24} /></button>
               </div>
            </div>
          )}
        </div>

        {/* Mini Player */}
        <AnimatePresence>
          {!isPlayerExpanded && (
            <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               onClick={() => setIsPlayerExpanded(true)}
               className="absolute bottom-[84px] inset-x-2 h-14 bg-zinc-900/95 backdrop-blur-2xl shadow-2xl rounded-xl overflow-hidden flex items-center px-2 z-40 border border-white/5 group active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                <img src={currentTrack.cover} className="w-full h-full object-cover" alt="c" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-[12px] font-bold truncate tracking-tight">{currentTrack.title}</div>
                <div className="text-[10px] text-zinc-400 font-bold truncate tracking-tight">{currentTrack.artist}</div>
              </div>
              <div className="flex items-center gap-4">
                <Heart size={20} className={likedTracks.includes(currentTrack.id) ? 'text-[#1DB954]' : 'text-white'} fill={likedTracks.includes(currentTrack.id) ? '#1DB954' : 'none'} />
                <button onClick={togglePlay} className="p-1">
                  {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full">
                 <div className="h-full bg-white transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Bar */}
        {!isPlayerExpanded && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-black/95 to-transparent flex items-center justify-around px-8 z-50">
            {[
              { id: 'home', icon: Home, label: 'Kezdőlap' },
              { id: 'search', icon: SearchIcon, label: 'Keresés' },
              { id: 'library', icon: Library, label: 'Saját Tár' }
            ].map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === tab.id ? 'text-white scale-110' : 'text-zinc-500 hover:text-white'}`}
              >
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Full Screen Player */}
        <AnimatePresence>
          {isPlayerExpanded && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed inset-0 z-[100] flex flex-col bg-[#121212]"
            >
              {/* Refined Background Gradient */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div 
                  animate={{ backgroundColor: currentTrack.color }}
                  className="w-full h-1/2 opacity-30 blur-[120px] scale-150 origin-top"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/80 to-[#121212]" />
              </div>

              <div className="relative z-10 flex flex-col h-full bg-transparent px-8 pt-4 pb-10 overflow-hidden text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <button onClick={() => setIsPlayerExpanded(false)} className="p-2 -ml-2 active:scale-75 transition-transform">
                    <ChevronDown size={32} />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-[0.1em] uppercase text-white/50 mb-0.5">LEJÁTSZÁS KERESÉSBŐL</span>
                    <span className="text-xs font-bold leading-none tracking-tight">„{currentTrack.artist}” keresése</span>
                  </div>
                  <button className="p-2 -mr-2"><MoreHorizontal size={28} /></button>
                </div>

                {/* Album Art Container - More flexible sizing */}
                <div className="flex-1 flex max-h-[420px] items-center justify-center mb-8 overflow-hidden">
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="w-full aspect-square max-w-[340px] rounded shadow-2xl overflow-hidden"
                   >
                     <img 
                       src={currentTrack.cover} 
                       className="w-full h-full object-cover" 
                       alt="cover" 
                     />
                   </motion.div>
                </div>

                {/* Info Container - Fixed at bottom area */}
                <div className="w-full max-w-[400px] mx-auto shrink-0">
                   {/* Track Info */}
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex-1 min-w-0 pr-4">
                        <h2 className="text-2xl font-black tracking-tighter mb-0.5 truncate">{currentTrack.title}</h2>
                        <p className="text-white/60 font-bold text-lg tracking-tight truncate">{currentTrack.artist}</p>
                      </div>
                      <button className="p-2 active:scale-75 transition-all">
                         <Plus size={32} className="text-white" />
                      </button>
                   </div>

                   {/* Progress Bar */}
                   <div className="w-full mb-8">
                      <div className="relative h-1 mb-2 bg-white/20 rounded-full group cursor-pointer overflow-hidden">
                         <div 
                           className="absolute left-0 top-0 h-full bg-white rounded-full" 
                           style={{ width: `${progressPercent}%` }} 
                         />
                         <input 
                           type="range"
                           min="0"
                           max={duration || 100}
                           value={currentTime}
                           onChange={handleSeek}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-white/50 tracking-tighter">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                   </div>

                   {/* Controls */}
                   <div className="flex items-center justify-between mb-8 px-2">
                      <Shuffle size={26} className="text-[#1DB954] hover:text-[#1ED760] transition-colors" />
                      <SkipBack onClick={handlePrev} size={42} className="fill-current hover:scale-110 active:scale-90 transition-transform cursor-pointer" />
                      <button 
                        onClick={togglePlay}
                        className="w-18 h-18 bg-white rounded-full flex items-center justify-center text-black shadow-xl active:scale-95 transition-transform hover:scale-105"
                      >
                        {isPlaying ? <Pause size={38} fill="black" /> : <Play size={38} fill="black" className="ml-1" />}
                      </button>
                      <SkipForward onClick={handleNext} size={42} className="fill-current hover:scale-110 active:scale-90 transition-transform cursor-pointer" />
                      <Repeat size={26} className="text-white/60 hover:text-white transition-colors" />
                   </div>

                   {/* Bottom Bar Controls */}
                   <div className="flex justify-between items-center text-white/70">
                      <button 
                       onClick={() => setShowDevices(!showDevices)} 
                       className={`flex items-center gap-2 transition-colors ${activeDeviceId !== deviceId ? 'text-[#1DB954]' : 'hover:text-white'}`}
                      >
                         <Speaker size={20} />
                         <span className="text-[10px] font-bold tracking-tight">
                           {activeDeviceId !== deviceId ? 'Csatlakozva' : `${userName} – WH-CH520`}
                         </span>
                      </button>
                      <div className="flex gap-8">
                        <Share2 size={22} className="hover:text-white transition-colors cursor-pointer" />
                        <ListMusic size={22} className="hover:text-white transition-colors cursor-pointer" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Device Selector Overlay */}
              <AnimatePresence>
                {showDevices && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowDevices(false)}
                      className="absolute inset-0 bg-black/60 z-[110] backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="absolute bottom-0 inset-x-0 bg-[#282828] rounded-t-3xl p-6 z-[120] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                      <h3 className="text-center text-xl font-black mb-8 tracking-tighter">Csatlakozás eszközhöz</h3>
                      
                      <div className="space-y-2 mb-8">
                        <button 
                          onClick={() => { setActiveDeviceId(deviceId); updateFirebasePlayback({ activeDeviceId: deviceId }); setShowDevices(false); }}
                          className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all ${activeDeviceId === deviceId ? 'bg-white/10 text-[#1DB954]' : 'hover:bg-white/5'}`}
                        >
                          <Smartphone className={activeDeviceId === deviceId ? 'text-[#1DB954]' : ''} />
                          <div className="text-left">
                            <p className="font-bold">Ez az eszköz</p>
                            <p className="text-xs text-white/40">Zenelejátszás ezen a telefonon</p>
                          </div>
                        </button>
                        
                        <button className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-white/5 transition-all text-white/60">
                          <Monitor />
                          <div className="text-left">
                            <p className="font-bold">Nappali TV</p>
                            <p className="text-xs text-white/40">Zenelejátszás a TV-n (Offline)</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { alert('Éppen csatlakozik...'); setShowDevices(false); }}
                          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-white/5 transition-all text-white/60"
                        >
                          <Laptop />
                          <div className="text-left">
                            <p className="font-bold">Bálint MacBook Pro-ja</p>
                            <p className="text-xs text-white/40">Közeli macOS eszköz</p>
                          </div>
                        </button>
                      </div>

                      <button 
                        onClick={() => setShowDevices(false)}
                        className="w-full py-4 font-black transition-colors hover:text-[#1DB954]"
                      >
                        MÉGSE
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpotifyApp;
