import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Search, Library, Play, Pause, SkipForward, 
  SkipBack, Repeat, Shuffle, Heart, MoreHorizontal,
  ChevronDown, Search as SearchIcon, ListMusic, Music,
  Settings, Clock, Bell, Plus, Pin
} from 'lucide-react';
import { auth } from '../../lib/firebase';

const MOCK_TRACKS = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400', color: '#f97316' },
  { id: 2, title: 'Levitating', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400', color: '#3b82f6' },
  { id: 3, title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400', color: '#a855f7' },
  { id: 4, title: 'Peaches', artist: 'Justin Bieber', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400', color: '#ec4899' },
  { id: 5, title: 'Save Your Tears', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=400', color: '#27272a' },
];

const PLAYLISTS = [
  { id: 1, title: 'Ezt hallgattad a legtöbbet', cover: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=200' },
  { id: 2, title: 'Daily Mix 1', cover: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=200' },
  { id: 3, title: 'Top Hits Hungary', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200' },
];

const SpotifyApp = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [progress, setProgress] = useState(35);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Bálint');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedTracks, setLikedTracks] = useState<number[]>([1, 2]); // Initial liked tracks

  const filteredTracks = searchQuery.trim() === '' 
    ? [] 
    : MOCK_TRACKS.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleLike = (trackId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedTracks(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
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
      const first = auth.currentUser.displayName.split(' ')[0];
      setUserName(first);
    }
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex-1 flex flex-col bg-black font-sans text-white overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-[300px] w-full z-0 overflow-hidden opacity-30 pointer-events-none">
        <motion.div 
          animate={{
            backgroundColor: [currentTrack.color, '#000000'],
          }}
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
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black tracking-tight">{greeting}, {userName}!</h1>
              <div className="flex gap-5 text-zinc-400">
                <button className="hover:text-white transition-colors"><Bell size={22} /></button>
                <button className="hover:text-white transition-colors"><Clock size={22} /></button>
                <button className="hover:text-white transition-colors" onClick={onClose}><Settings size={22} /></button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-32">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-5 mb-8">
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_TRACKS.slice(0, 4).map((track, i) => (
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
                      <img src={track.cover} className="w-14 h-14 object-cover shadow-lg shadow-black/40" alt={track.title} />
                      <div className="text-[11px] font-bold tracking-tight line-clamp-2 pr-2">{track.title}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <section className="mb-10">
                <h2 className="px-5 text-xl font-black mb-4 tracking-tighter">Folytasd ahol abbahagytad</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-4">
                  {MOCK_TRACKS.map((track, i) => (
                    <motion.div 
                      key={track.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="min-w-[155px] flex flex-col group cursor-pointer active:scale-95 transition-transform"
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                      }}
                    >
                      <div className="w-[155px] h-[155px] rounded-xl overflow-hidden shadow-2xl mb-3 relative group-hover:shadow-[#1DB954]/10 transition-all">
                        <img src={track.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={track.title} />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                        
                        {currentTrack.id === track.id && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="flex gap-1.5 items-end h-8">
                               <motion.div animate={{ height: isPlaying ? [12, 32, 12] : 4 }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-[#1DB954] rounded-full shadow-[0_0_10px_#1DB954]" />
                               <motion.div animate={{ height: isPlaying ? [20, 8, 32, 20] : 6 }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-[#1DB954] rounded-full shadow-[0_0_10px_#1DB954]" />
                               <motion.div animate={{ height: isPlaying ? [32, 12, 32] : 4 }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-[#1DB954] rounded-full shadow-[0_0_10px_#1DB954]" />
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

              <section className="mb-10">
                <h2 className="px-5 text-xl font-black mb-4 tracking-tighter uppercase text-zinc-500 text-[10px]">Neked készült</h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
                  {PLAYLISTS.map((playlist, i) => (
                    <motion.div 
                      key={playlist.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="min-w-[140px] flex flex-col cursor-pointer group"
                    >
                      <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden mb-3 border border-white/5 relative shadow-xl">
                        <img src={playlist.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <Play size={20} fill="black" className="ml-1" />
                        </div>
                      </div>
                      <div className="text-xs font-bold leading-tight">{playlist.title}</div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-20">
              <h2 className="text-3xl font-black mb-6 tracking-tighter">Keresés</h2>
              <div className="relative mb-8">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  autoFocus
                  placeholder="Művész, dal vagy podcast"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-zinc-900 h-12 rounded-lg pl-12 pr-4 font-bold outline-none focus:ring-4 focus:ring-[#1DB954]/20 transition-all"
                />
              </div>

              {searchQuery.trim() === '' ? (
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {['Pop', 'Hip-hop', 'Rock', 'Indie', 'Gaming', 'Workout'].map((cat, i) => (
                    <div key={cat} className={`h-24 rounded-lg p-3 relative overflow-hidden bg-gradient-to-br transition-transform active:scale-95 cursor-pointer ${
                      i % 3 === 0 ? 'from-purple-600 to-indigo-800' : 
                      i % 3 === 1 ? 'from-emerald-600 to-teal-800' : 'from-rose-600 to-pink-800'
                    }`}>
                      <span className="font-bold text-lg tracking-tight relative z-10">{cat}</span>
                      <Music size={60} className="absolute -bottom-2 -right-4 text-black/10 rotate-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  {filteredTracks.length > 0 ? (
                    filteredTracks.map(track => (
                      <div 
                        key={track.id} 
                        onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group active:scale-[0.98] transition-all"
                      >
                        <img src={track.cover} className="w-12 h-12 rounded object-cover shadow-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{track.title}</div>
                          <div className="text-xs text-zinc-500 font-bold truncate">{track.artist}</div>
                        </div>
                        <Heart 
                          size={18} 
                          className={`transition-colors ${likedTracks.includes(track.id) ? 'text-[#1DB954]' : 'text-zinc-600'}`} 
                          fill={likedTracks.includes(track.id) ? '#1DB954' : 'none'}
                          onClick={(e) => toggleLike(track.id, e)}
                        />
                        <MoreHorizontal size={18} className="text-zinc-600" />
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-zinc-500">
                      <SearchIcon size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">Nincs találat erre: "{searchQuery}"</p>
                      <p className="text-sm">Ellenőrizd a helyesírást vagy keress mást.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">B</div>
                    <h2 className="text-2xl font-black tracking-tighter">Saját Tár</h2>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-zinc-400 hover:text-white transition-colors"><SearchIcon size={22} /></button>
                    <button className="text-zinc-400 hover:text-white transition-colors"><Plus size={22} /></button>
                  </div>
               </div>

               <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                 {['Lejátszási listák', 'Művészek', 'Albumok', 'Podcastok'].map(filter => (
                   <button key={filter} className="whitespace-nowrap px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors">
                     {filter}
                   </button>
                 ))}
               </div>

               <div className="space-y-4">
                  <div 
                    className="flex items-center gap-4 group cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                       // Future: Show liked songs playlist
                    }}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-400 flex items-center justify-center shadow-xl">
                      <Heart size={28} fill="white" className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Kedvelt dalok</div>
                      <div className="text-[11px] text-[#1DB954] font-bold flex items-center gap-1">
                        <Pin size={10} fill="#1DB954" />
                        Lejátszási lista • {likedTracks.length} dal
                      </div>
                    </div>
                  </div>

                  {PLAYLISTS.map(playlist => (
                    <div key={playlist.id} className="flex items-center gap-4 group cursor-pointer active:scale-95 transition-transform">
                      <img src={playlist.cover} className="w-16 h-16 rounded-lg object-cover shadow-xl" />
                      <div>
                        <div className="font-bold text-sm">{playlist.title}</div>
                        <div className="text-[11px] text-zinc-500 font-bold">Lejátszási lista • Spotify</div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                       <Plus size={32} className="text-zinc-400" />
                    </div>
                    <div className="font-bold text-sm text-zinc-400">Új lista hozzáadása</div>
                  </div>
               </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {!isPlayerExpanded && (
            <motion.div 
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               onClick={() => setIsPlayerExpanded(true)}
               className="absolute bottom-[84px] inset-x-2 h-14 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl rounded-xl overflow-hidden flex items-center px-3 z-40 border border-white/10 group active:scale-[0.98] transition-transform"
            >
              <img src={currentTrack.cover} className="w-10 h-10 rounded-lg shadow-2xl object-cover mr-4" alt="c" />
              <div className="flex-1 overflow-hidden">
                <div className="text-[12px] font-bold truncate tracking-tight">{currentTrack.title}</div>
                <div className="text-[10px] text-zinc-400 font-bold truncate tracking-tight">{currentTrack.artist}</div>
              </div>
              <div className="flex items-center gap-5 px-3">
                <Heart size={18} className="text-[#1DB954] drop-shadow-[0_0_5px_#1DB954]" fill="#1DB954" />
                <button onClick={togglePlay} className="p-1 hover:scale-110 active:scale-90 transition-transform">
                  {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                </button>
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full overflow-hidden">
                 <motion.div 
                   animate={{ width: `${progress}%` }} 
                   className="h-full bg-white shadow-[0_0_8px_white]" 
                 />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isPlayerExpanded && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-black/98 to-transparent flex items-center justify-around px-8 z-50">
            <div 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${activeTab === 'home' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <Home size={22} className="group-hover:scale-110 transition-transform" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-black tracking-tight">Kezdőlap</span>
            </div>
            <div 
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${activeTab === 'search' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <SearchIcon size={22} className="group-hover:scale-110 transition-transform" strokeWidth={activeTab === 'search' ? 2.5 : 2} />
              <span className="text-[10px] font-black tracking-tight">Keresés</span>
            </div>
            <div 
              onClick={() => setActiveTab('library')}
              className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${activeTab === 'library' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <Library size={22} className="group-hover:scale-110 transition-transform" strokeWidth={activeTab === 'library' ? 2.5 : 2} />
              <span className="text-[10px] font-black tracking-tight">Saját Tár</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isPlayerExpanded && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed inset-0 z-[100] flex flex-col"
              style={{ backgroundColor: currentTrack.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full p-8 pt-12">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setIsPlayerExpanded(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><ChevronDown size={32} /></button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40">Lejátszási lista</span>
                    <span className="text-xs font-bold leading-none">Népszerű slágerek</span>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal size={28} /></button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.5 }}
                     className="w-full aspect-square max-w-[340px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mb-12 border border-white/10"
                   >
                     <img src={currentTrack.cover} className="w-full h-full object-cover" alt="c" />
                   </motion.div>

                   <div className="w-full mb-10 px-2">
                     <div className="flex justify-between items-center mb-1">
                        <div className="flex-1">
                          <h2 className="text-2xl font-black tracking-tighter mb-1">{currentTrack.title}</h2>
                          <p className="text-white/60 font-bold text-lg tracking-tight">{currentTrack.artist}</p>
                        </div>
                        <button 
                          onClick={(e) => toggleLike(currentTrack.id, e)}
                          className="p-2 active:scale-75 transition-transform"
                        >
                           <Heart 
                             size={28} 
                             className={`drop-shadow-[0_0_10px_#1DB954] transition-colors ${likedTracks.includes(currentTrack.id) ? 'text-[#1DB954]' : 'text-white/40'}`} 
                             fill={likedTracks.includes(currentTrack.id) ? '#1DB954' : 'none'} 
                           />
                        </button>
                      </div>
                   </div>

                   <div className="w-full space-y-4 px-2">
                     <div className="relative h-[4px] bg-white/20 rounded-full cursor-pointer group">
                        <motion.div 
                          animate={{ width: `${progress}%` }} 
                          className="absolute left-0 h-full bg-white rounded-full relative"
                        >
                           <div className="absolute -right-2 -top-1.5 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                     </div>
                     <div className="flex justify-between text-[11px] font-black text-white/40 tracking-wider">
                       <span>1:24</span>
                       <span>3:45</span>
                     </div>
                   </div>

                   <div className="w-full flex items-center justify-between mt-10 px-4">
                      <Shuffle size={20} className="text-white/40 hover:text-white transition-colors" />
                      <SkipBack size={38} className="fill-current hover:scale-110 active:scale-90 transition-transform" />
                      <button 
                        onClick={togglePlay}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-transform hover:scale-105"
                      >
                        {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" className="ml-2" />}
                      </button>
                      <SkipForward size={38} className="fill-current hover:scale-110 active:scale-90 transition-transform" />
                      <Repeat size={20} className="text-white/40 hover:text-white transition-colors" />
                   </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-white/60 px-4 pb-4">
                   <Music size={22} className="hover:text-white transition-colors cursor-pointer" />
                   <ListMusic size={22} className="hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpotifyApp;
