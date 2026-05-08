import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Play, 
  Plus, 
  Search, 
  Check, 
  Home, 
  Tv, 
  Loader2, 
  ArrowLeft, 
  X, 
  ThumbsUp,
  Download,
  Info,
  ChevronRight,
  Bell,
  Share2,
  Pencil,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { movieDB, GENRES } from "../../lib/movie-db";
import { Content, Episode } from "../../types/netflix";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";

// --- Utility ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const DraggableRow = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const contentWidth = containerRef.current.scrollWidth;
            setConstraints({
                left: -(contentWidth - containerWidth + 32), // 32 for padding
                right: 0
            });
        }
    }, [children]);

    return (
        <div ref={containerRef} className="relative overflow-hidden -mx-4 px-4 pb-4">
            <motion.div 
                drag="x"
                dragConstraints={constraints}
                dragElastic={0.1}
                dragTransition={{ power: 0.2, timeConstant: 200 }}
                className={cn(
                    "flex gap-3 cursor-grab active:cursor-grabbing",
                    className
                )}
            >
                {children}
            </motion.div>
        </div>
    );
};

// --- Sub-components (largely for presentation) ---

const EpisodeCard = ({ episode, onPlay, isActive }: { episode: Episode, onPlay: (content: Content | Episode) => void, isActive?: boolean, [key: string]: any }) => {
    return (
        <div 
          className={cn(
            "flex gap-4 items-center p-3 rounded-xl cursor-pointer group transition-all duration-300",
            isActive ? "bg-white/10" : "hover:bg-white/5"
          )} 
          onClick={() => onPlay(episode)}
        >
            <div className="relative w-32 md:w-40 aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 shadow-lg">
                <img src={episode.thumbnailUrl} alt={episode.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <div className="h-10 w-10 rounded-full border-2 border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <Play className="h-4 w-4 fill-white text-white ml-1" />
                    </div>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-sm md:text-base text-white truncate">{episode.episode}. {episode.title}</h4>
                    <p className="text-[10px] md:text-xs font-black text-neutral-500 uppercase flex-shrink-0">{episode.duration}</p>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{episode.description}</p>
            </div>
        </div>
    )
}

const MovieDetailView = ({ 
  movie, 
  onClose, 
  onToggleMyList, 
  isInMyList, 
  onPlay, 
  isLiked,
  onToggleLike,
  profile,
  playingContent
}: { 
  movie: Content, 
  onClose: () => void, 
  onToggleMyList: (movieId: string) => void, 
  isInMyList: boolean, 
  onPlay: (content: Content | Episode) => void, 
  isLiked: boolean,
  onToggleLike: (movieId: string) => void,
  profile: any,
  playingContent: any
}) => {
    const [selectedSeason, setSelectedSeason] = useState(movie.seasons?.[0]?.season || 1);
    
    const currentTrailerUrl = useMemo(() => {
        if (movie.type === 'series' && movie.seasons) {
            const season = movie.seasons.find(s => s.season === selectedSeason);
            return season?.trailerUrl || movie.trailerUrl;
        }
        return movie.trailerUrl;
    }, [movie, selectedSeason]);

    const handlePlay = () => {
        if (movie.type === 'series' && movie.seasons) {
            const episodes = movie.seasons.find(s => s.season === selectedSeason)?.episodes || movie.seasons[0].episodes;
            onPlay(episodes[0]);
        } else {
            onPlay(movie);
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black overflow-y-auto no-scrollbar"
        >
            <div className="relative w-full aspect-video bg-black">
                {currentTrailerUrl ? (
                    <div className="w-full h-full overflow-hidden pointer-events-none scale-125 pt-[56.25%] relative">
                        <iframe 
                            src={`${currentTrailerUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentTrailerUrl.split('/').pop()?.split('?')[0]}&rel=0&modestbranding=1`}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                        />
                    </div>
                ) : (
                    <img
                        src={movie.imageUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                {/* Center Play Button on image */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={handlePlay}
                      className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-2 border-white/60 hover:scale-110 active:scale-95 transition-all shadow-2xl"
                    >
                      <Play fill="white" className="text-white ml-1" size={28} />
                    </button>
                </div>

                <button 
                  onClick={onClose}
                  className="absolute top-12 left-6 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10"
                >
                    <ArrowLeft className="text-white" size={20}/>
                </button>
            </div>

            <div className="relative z-10 flex flex-col gap-4 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 h-6 mb-1">
                    <img 
                      src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" 
                      className="h-6 w-auto" 
                      alt="Netflix" 
                    />
                    <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase mt-0.5">
                      {movie.type === 'series' ? 'sorozat' : 'film'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold text-white tracking-tighter">
                    {movie.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mt-1">
                      <span>{movie.year}</span>
                      <span className="bg-neutral-800 rounded px-1.5 py-0.5 text-[10px] text-white">16+</span>
                      <span>{movie.duration}</span>
                      <span className="border border-neutral-700 px-1 py-0.5 text-[8px] rounded uppercase font-black">HDR10+</span>
                  </div>
                </div>

                {/* Info Ranking Badge */}
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 relative flex flex-col items-center justify-center bg-red-600 rounded-sm">
                        <span className="text-[4px] font-black leading-none mt-0.5">TOP</span>
                        <span className="text-[11px] font-black leading-none">10</span>
                    </div>
                    <span className="text-[15px] font-bold text-white">5. legnépszerűbb tévéműsor ma</span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    className="h-11 w-full bg-white text-black rounded flex items-center justify-center font-black transition-all active:scale-[0.98]" 
                    onClick={handlePlay}
                  >
                      <Play size={22} className="mr-2 fill-black" />
                      <span className="text-base">Lejátszás</span>
                  </button>
                  <button 
                    className="h-11 w-full bg-neutral-800/90 text-white rounded flex items-center justify-center font-black transition-all active:scale-[0.98]" 
                  >
                      <Download size={20} className="mr-2" />
                      <span className="text-base">
                        {movie.type === 'movie' ? 'Letöltés' : 'Töltsd le: 1. é./5. ep.'}
                      </span>
                  </button>
                </div>

                <p className="text-[15px] leading-relaxed text-white font-medium mt-2">
                  {movie.description}
                </p>

                <div className="text-[13px] space-y-0.5 mt-2">
                  <p className="line-clamp-1"><span className="text-neutral-500 font-medium">Főszerepben:</span> <span className="text-neutral-400">{movie.cast.join(', ')}...</span></p>
                  <p className="text-neutral-500 font-medium cursor-pointer hover:text-neutral-300">további szereplők</p>
                  <p><span className="text-neutral-500 font-medium">Alkotó:</span> <span className="text-neutral-400">Neil Forsyth</span></p>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex justify-around pt-2 pb-6">
                    <button onClick={() => onToggleMyList(movie.id)} className="flex flex-col items-center gap-1.5 transition-colors active:text-white">
                        {isInMyList ? <Check size={28} className="text-white" /> : <Plus size={28} className="text-neutral-400" />}
                        <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">Saját listám</span>
                    </button>
                    <button onClick={() => onToggleLike(movie.id)} className="flex flex-col items-center gap-1.5 transition-colors active:text-white">
                        <ThumbsUp size={24} className={isLiked ? "text-white fill-white" : "text-neutral-400"} />
                        <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">Értékelés</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 transition-colors active:text-white">
                        <Share2 size={24} className="text-neutral-400" />
                        <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">Megosztás</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 transition-colors active:text-white">
                        <Download size={24} className="text-neutral-400" />
                        <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">Letöltés</span>
                    </button>
                </div>

                {movie.type === 'series' && movie.seasons && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Epizódok</h3>
                            <div className="relative">
                              <select 
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                className="bg-neutral-800 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 appearance-none pr-8 cursor-pointer border border-white/10"
                              >
                                {(movie.seasons || []).map(s => (
                                  <option key={s.season} value={s.season}>{s.season}. évad</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            {movie.seasons.find(s => s.season === selectedSeason)?.episodes.map((episode, i) => (
                                <EpisodeCard 
                                  key={i} 
                                  episode={episode} 
                                  onPlay={onPlay} 
                                  isActive={playingContent?.embedUrl === episode.embedUrl}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="h-40" />
        </motion.div>
    )
};

const MovieCard = ({ movie, onSelect, isContinueWatching, idx }: { movie: Content, onSelect: (movie: Content) => void, isContinueWatching?: boolean, idx?: number, [key: string]: any }) => (
    <motion.div 
        layoutId={`movie-card-${movie.id}-${isContinueWatching ? 'cont' : 'grid'}`}
        onTap={() => onSelect(movie)} 
        className={cn(
          "flex-shrink-0 relative rounded-lg overflow-hidden cursor-pointer group shadow-2xl transition-all",
          isContinueWatching 
            ? "w-[240px] md:w-[320px] aspect-video" 
            : "w-[150px] md:w-[200px] aspect-[10/16]"
        )}
        whileTap={{ scale: 0.98 }}
    >
        <img 
            src={movie.imageUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />
        
        {/* N Logo Corner Badge */}
        {!isContinueWatching && (
            <div className="absolute top-2 left-2 z-10 transition-transform group-hover:scale-110">
                <img 
                    src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" 
                    className="h-6 md:h-8 w-auto drop-shadow-lg" 
                    alt="N" 
                />
            </div>
        )}

        {/* TOP 10 Badge - shown for some items for variety */}
        {!isContinueWatching && idx !== undefined && idx % 4 === 0 && (
            <div className="absolute top-2 right-2 z-10">
                <div className="w-6 h-7 bg-red-600 rounded-sm flex flex-col items-center justify-center text-[5px] font-black leading-none text-white shadow-lg">
                  <span className="scale-75 text-[7px] font-bold">TOP</span>
                  <span className="text-[12px] -mt-0.5 font-bold">10</span>
                </div>
            </div>
        )}

        {isContinueWatching ? (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs md:text-sm font-bold text-white truncate pr-2">{movie.title}</p>
                    <div className="h-6 w-6 rounded-full border border-white/40 flex items-center justify-center">
                        <Play size={10} className="fill-white text-white ml-0.5" />
                    </div>
                </div>
                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E50914] w-[45%]" />
                </div>
            </div>
        ) : (
            <div className="absolute bottom-3 left-3 right-3 text-center">
                <h4 className="text-xs md:text-sm font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                    {movie.title}
                </h4>
                {movie.isOriginal && (
                   <p className="text-[8px] font-black text-red-600 uppercase mt-1 tracking-widest drop-shadow-md">Netflix Eredeti</p>
                )}
            </div>
        )}
    </motion.div>
);

const SearchOverlay = ({ onClose, onSelect }: { onClose: () => void, onSelect: (movie: Content) => void }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Content[]>([]);

    const handleSearch = (q: string) => {
        setQuery(q);
        if (q.trim().length > 1) {
            const filtered = movieDB.filter(m => m.title.toLowerCase().includes(q.toLowerCase()));
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-neutral-900 flex flex-col"
        >
            <div className="pt-12 px-4 pb-4 border-b border-neutral-800 flex items-center gap-4 bg-neutral-900">
                <button onClick={onClose}><ArrowLeft className="text-white" /></button>
                <div className="flex-1 bg-neutral-700 rounded-md flex items-center px-4 py-2">
                  <Search size={18} className="text-neutral-400 mr-2" />
                  <input 
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Keress filmet..."
                      className="bg-transparent border-none text-white text-md focus:outline-none w-full"
                      autoFocus
                  />
                  {query && <X size={18} className="text-neutral-400 cursor-pointer" onClick={() => handleSearch("")} />}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {results.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {results.map(movie => (
                            <div key={movie.id} onClick={() => onSelect(movie)} className="flex flex-col gap-1 cursor-pointer">
                                <div className="aspect-[2/3] rounded overflow-hidden">
                                    <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] text-white truncate text-center font-medium">{movie.title}</span>
                            </div>
                        ))}
                    </div>
                ) : query.length > 1 ? (
                  <p className="text-center text-neutral-500 mt-20">Nincs találat.</p>
                ) : (
                  <div className="space-y-6">
                    <h3 className="font-bold text-white">Népszerű keresések</h3>
                    {movieDB.slice(0, 3).map(m => (
                      <div key={m.id} onClick={() => onSelect(m)} className="flex items-center gap-4 bg-neutral-800/50 p-2 rounded-lg cursor-pointer">
                        <img src={m.imageUrl} className="w-20 aspect-video object-cover rounded" alt="q" />
                        <span className="flex-1 text-sm font-bold text-white">{m.title}</span>
                        <Play size={20} className="text-white mr-2" />
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </motion.div>
    );
}

const MyListFullScreen = ({ 
  movies, 
  onClose, 
  onSelect,
  onPlay
}: { 
  movies: Content[], 
  onClose: () => void, 
  onSelect: (movie: Content) => void,
  onPlay: (movie: Content) => void
}) => {
    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col"
        >
            <div className="pt-12 px-4 pb-4 flex items-center justify-between border-b border-red-600/30">
                <div className="flex items-center gap-6">
                    <button onClick={onClose}><ArrowLeft className="text-white" size={24} /></button>
                    <h2 className="text-xl font-bold text-white tracking-tight">Saját listám</h2>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Pencil size={20} className="text-white" />
                </button>
            </div>

            <div className="flex bg-black">
                <div className="flex-1 py-3 text-center border-b-2 border-red-600">
                    <span className="text-sm font-bold text-white">Tévéműsorok és filmek</span>
                </div>
                <div className="flex-1 py-3 text-center border-b-2 border-transparent">
                    <span className="text-sm font-bold text-neutral-500">Játékok</span>
                </div>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto no-scrollbar pb-32">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {["Nem elkezdett", "Elkezdett", "TV-műsorok"].map((filter, i) => (
                        <button key={i} className="px-5 py-1.5 rounded-full border border-neutral-700 bg-neutral-900 text-sm font-bold text-neutral-300 whitespace-nowrap">
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-neutral-400">Rendezés</span>
                    <button className="flex items-center gap-1 text-xs font-bold text-white">
                        Ajánlott <ChevronDown size={14} />
                    </button>
                </div>

                <div className="space-y-4">
                    {movies.map(movie => (
                        <div key={movie.id} onClick={() => onSelect(movie)} className="flex gap-4 items-center group cursor-pointer">
                            <div className="relative w-32 aspect-video flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                                <img src={movie.imageUrl} className="w-full h-full object-cover" alt="" />
                                {/* Bottom corner text indicator (Common on this specific view) */}
                                <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className="text-[10px] font-black italic text-white uppercase drop-shadow-md">{movie.title}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <h4 className="text-sm font-medium text-white truncate">{movie.title}</h4>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
                                  className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center bg-black/40 hover:bg-white/10 transition-colors"
                                >
                                    <Play size={14} fill="white" className="text-white ml-0.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default function NetflixApp({ onClose, user }: { onClose: () => void, user: any }) {
    const [profile, setProfile] = useState<any>(null);
    const [selectedMovie, setSelectedMovie] = useState<Content | null>(null);
    const [playingContent, setPlayingContent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'mynetflix'>('home');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMyListOpen, setMyListOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) setProfile(snap.data());
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });
      return () => unsub();
    }, [user]);

    const handlePlay = (content: any) => {
        setPlayingContent(content);
    };

    const handleToggleMyList = async (movieId: string) => {
      if (!user || !profile) return;
      const ref = doc(db, 'users', user.uid);
      const currentList = profile.netflixMyList || [];
      const newList = currentList.includes(movieId) 
        ? currentList.filter((id: string) => id !== movieId)
        : [...currentList, movieId];
      
      try {
        await updateDoc(ref, { netflixMyList: newList });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    };

    const handleToggleLike = async (movieId: string) => {
      if (!user || !profile) return;
      const ref = doc(db, 'users', user.uid);
      const liked = profile.netflixLikedContent || [];
      const newList = liked.includes(movieId)
        ? liked.filter((id: string) => id !== movieId)
        : [...liked, movieId];
      
      try {
        await updateDoc(ref, { netflixLikedContent: newList });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    };

    const filteredMovies = useMemo(() => {
        if (!activeCategory) return movieDB;
        if (activeCategory === 'Sorozatok') return movieDB.filter(m => m.type === 'series');
        if (activeCategory === 'Filmek') return movieDB.filter(m => m.type === 'movie');
        if (activeCategory === 'Új és fel...') return movieDB.filter(m => m.genres.includes(GENRES.NEW) || m.genres.includes(GENRES.POPULAR));
        if (activeCategory === 'Játékok') return []; // We don't have games yet
        return movieDB;
    }, [activeCategory]);

    // --- Sections for My Netflix ---
    const likedContent = movieDB.filter(m => (profile?.netflixLikedContent || []).includes(m.id));
    const myListMovies = movieDB.filter(m => profile ? (profile.netflixMyList || []).includes(m.id) : []);
    const myListShort = myListMovies.slice(0, 3);
    const featuredMovie = useMemo(() => {
        const list = activeCategory === 'Sorozatok' 
            ? movieDB.filter(m => m.type === 'series')
            : activeCategory === 'Filmek'
                ? movieDB.filter(m => m.type === 'movie')
                : movieDB;
        
        // Randomly pick an item from the list to make the hero section dynamic
        if (list.length === 0) return movieDB[0];
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }, [activeCategory]);

    if (!profile) return (
      <div className="flex h-full items-center justify-center bg-black">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#141414] text-white overflow-hidden relative font-sans">
            <AnimatePresence>
                {playingContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black flex items-center justify-center"
                    >
                         <button 
                            className="absolute top-12 left-6 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-transform active:scale-75" 
                            onClick={() => setPlayingContent(null)}
                         >
                            <ArrowLeft className="text-white" size={28} />
                        </button>
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={playingContent.embedUrl}
                            frameBorder="0" 
                            allowFullScreen
                        ></iframe>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedMovie && (
                    <MovieDetailView 
                        movie={selectedMovie} 
                        onClose={() => setSelectedMovie(null)}
                        onToggleMyList={handleToggleMyList}
                        isInMyList={(profile.netflixMyList || []).includes(selectedMovie.id)}
                        onPlay={handlePlay}
                        onToggleLike={handleToggleLike}
                        isLiked={(profile.netflixLikedContent || []).includes(selectedMovie.id)}
                        profile={profile}
                        playingContent={playingContent}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSearchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onSelect={(m) => { setSelectedMovie(m); setSearchOpen(false); }} />}
            </AnimatePresence>

            <AnimatePresence>
                {isMyListOpen && (
                    <MyListFullScreen 
                        movies={myListMovies} 
                        onClose={() => setMyListOpen(false)} 
                        onSelect={(m) => { setSelectedMovie(m); setMyListOpen(false); }} 
                        onPlay={handlePlay}
                    />
                )}
            </AnimatePresence>

            <header className={cn(
              "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
              scrolled || activeCategory ? 'bg-neutral-900/90 backdrop-blur-xl' : 'bg-transparent'
            )}>
                <div className="flex items-center justify-between px-4 pt-10 pb-2">
                    <div className="flex items-center gap-2">
                      {activeCategory ? (
                        <button onClick={() => setActiveCategory(null)} className="mr-2 active:scale-75 transition-transform p-1">
                            <ArrowLeft size={24} className="text-white" />
                        </button>
                      ) : (
                        <div 
                          className="cursor-pointer transition-transform active:scale-95"
                          onClick={() => { setActiveCategory(null); setActiveTab('home'); }}
                        >
                          <img 
                              src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" 
                              className="h-10 w-auto" 
                              alt="Netflix" 
                          />
                        </div>
                      )}
                      <h1 
                        className="text-xl font-bold text-white tracking-tight cursor-pointer"
                        onClick={() => { if(!activeCategory) { setActiveCategory(null); setActiveTab('home'); } }}
                      >
                        {activeCategory || 'Kezdőoldal'}
                      </h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <Download size={24} className="text-white" />
                      <div className="relative">
                        <Bell size={24} className="text-white" />
                        {(profile.notifications?.length || 0) > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                            {profile.notifications.length > 9 ? '9+' : profile.notifications.length}
                          </div>
                        )}
                        {!profile.notifications && (
                          <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-[10px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">16</div>
                        )}
                      </div>
                    </div>
                </div>
                {!activeCategory && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar"
                    >
                        {['Sorozatok', 'Filmek', 'Játékok', 'Új és fel...'].map((chip, i) => (
                           <button 
                             key={i} 
                             onClick={() => setActiveCategory(activeCategory === chip ? null : chip)}
                             className={cn(
                               "px-4 py-1.5 border rounded-full text-[13px] font-bold whitespace-nowrap transition-all",
                               activeCategory === chip 
                                 ? "bg-white text-black border-white" 
                                 : "bg-neutral-800/80 border-white/10 text-white"
                             )}
                           >
                             {chip}
                           </button>
                        ))}
                    </motion.div>
                )}
            </header>

            <main 
              className="flex-1 overflow-y-auto no-scrollbar"
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 50)}
            >
                {activeTab === 'home' ? (
                  <>
                    <section className={cn(
                        "px-4 transition-all duration-500",
                        activeCategory ? "pt-24" : "pt-44 md:pt-60"
                    )}>
                      {activeCategory && (
                        <div className="flex items-center mb-6">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/40 bg-black/20 backdrop-blur-md text-sm font-bold text-white active:scale-95 transition-all">
                                Összes kategória <ChevronDown size={14} />
                            </button>
                        </div>
                      )}
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group" onClick={() => setSelectedMovie(featuredMovie)}>
                        <img src={featuredMovie.imageUrl} alt="f" className="w-full aspect-[3/4] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/40" />
                        
                        <div className="absolute bottom-8 left-0 right-0 z-10 px-4 flex flex-col items-center gap-4">
                          <h1 className="text-3xl font-bold text-white text-center tracking-tight drop-shadow-lg uppercase italic">
                            {featuredMovie.title}
                          </h1>
                          <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 bg-red-600 rounded-sm flex flex-col items-center justify-center text-[4px] font-black leading-none text-white shadow-lg">
                                    <span className="scale-[0.6]">TOP</span>
                                    <span className="text-[10px] -mt-0.5">10</span>
                                </div>
                                <span className="text-[13px] font-black text-white drop-shadow-md">
                                    {featuredMovie.type === 'series' ? '4. legnépszerűbb sorozat ma' : '4. legnépszerűbb film ma'}
                                </span>
                          </div>
                          <div className="flex gap-3 w-full max-w-sm">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handlePlay(featuredMovie); }}
                              className="flex-1 h-11 bg-white text-black rounded font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                              <Play size={18} fill="black" /> Lejátszás
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleToggleMyList(featuredMovie.id); }}
                              className="flex-1 h-11 bg-neutral-800/80 text-white rounded font-black flex items-center justify-center gap-2 backdrop-blur-xl active:scale-95 transition-transform"
                            >
                              {(profile.netflixMyList || []).includes(featuredMovie.id) ? (
                                <Check size={18} className="text-white" />
                              ) : (
                                <Plus size={18}/>
                              )}
                              Saját listám
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className={cn("space-y-10 px-4 mt-8 pb-32")}>
                        {activeCategory && (
                            <section className="space-y-3">
                                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Kizárólag a Netflix műsorán</h3>
                                <DraggableRow>
                                    {movieDB
                                        .filter(m => m.isOriginal && (activeCategory === 'Sorozatok' ? m.type === 'series' : activeCategory === 'Filmek' ? m.type === 'movie' : true))
                                        .map((m, mIdx) => (
                                            <MovieCard 
                                                key={m.id} 
                                                movie={m} 
                                                onSelect={setSelectedMovie} 
                                                idx={mIdx}
                                            />
                                        ))
                                    }
                                </DraggableRow>
                            </section>
                        )}

                        <section className="space-y-3">
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                {activeCategory ? `Újonnan a kínálatban: ${activeCategory}` : `Nézd tovább, ${profile?.settings?.displayName || 'asdkiller'}`}
                            </h3>
                            <DraggableRow>
                              {filteredMovies.map((m, idx) => (
                                <MovieCard 
                                    key={m.id} 
                                    movie={m} 
                                    onSelect={setSelectedMovie} 
                                    isContinueWatching={!activeCategory} 
                                    idx={idx}
                                />
                              ))}
                            </DraggableRow>
                        </section>

                        {Object.values(GENRES).map((title, idx) => {
                          const movies = filteredMovies.filter(m => m.genres.includes(title));
                          if (movies.length === 0) return null;
                          return (
                            <section key={idx} className="space-y-3">
                                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h3>
                                <DraggableRow>
                                  {movies.map((m, mIdx) => (
                                    <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} idx={mIdx} />
                                  ))}
                                </DraggableRow>
                            </section>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="px-4 pt-32 pb-32 space-y-12">
                    {/* Section: Liked Content (Now at the top per request) */}
                    <div className="space-y-4">
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Tévéműsorok és filmek, amelyek tetszettek</h2>
                        {likedContent.length > 0 ? (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                            {likedContent.map(movie => (
                                <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/5 shadow-xl transition-transform active:scale-95 group">
                                    <div className="aspect-[2/3] relative">
                                        <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                           <ThumbsUp size={20} className="text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                        <div className="py-10 text-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-white/5">
                            <p className="text-sm font-medium">Még nem értékeltél semmit.</p>
                            <button 
                                onClick={() => setActiveTab('home')}
                                className="mt-2 text-xs font-bold text-red-600 uppercase tracking-widest"
                            >
                                Bongészés
                            </button>
                        </div>
                        )}
                    </div>

                    {/* Section: My List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Saját listám</h2>
                            {myListMovies.length > 3 && (
                                <button 
                                    onClick={() => setMyListOpen(true)}
                                    className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                                >
                                    Összes <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                        {myListMovies.length > 0 ? (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                            {myListShort.map(movie => (
                                <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/5 shadow-xl transition-transform active:scale-95 group">
                                    <div className="aspect-[2/3] relative">
                                        <img src={movie.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                        <div className="py-10 text-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-white/5">
                            <p className="text-sm font-medium">A listád még üres.</p>
                        </div>
                        )}
                    </div>
                  </div>
                )}
            </main>
            
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/5 flex justify-around items-center px-4 pb-6 z-50">
                <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-neutral-500'}`}>
                    <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Kezdőoldal</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 text-neutral-500">
                    <Search size={24} />
                    <span className="text-[10px] font-medium">Keresés</span>
                </button>
                <button onClick={() => setActiveTab('mynetflix')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'mynetflix' ? 'text-white' : 'text-neutral-500'}`}>
                    <div className="w-6 h-6 rounded-sm bg-blue-600 overflow-hidden mb-0.5 relative">
                       <img src={profile?.settings?.photoURL} className="w-full h-full object-cover" alt="me" />
                       <div className="absolute inset-0 border border-white/20" />
                    </div>
                    <span className="text-[10px] font-medium">Az én Netflixem</span>
                </button>
            </nav>
        </div>
    )
}
