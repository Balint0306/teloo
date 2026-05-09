import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { 
  Play, 
  Pause,
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
  ChevronDown,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  RotateCcw,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { movieDB, GENRES } from "../../lib/movie-db";
import { Content, Episode } from "../../types/netflix";
import { doc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestoreErrorHandler";

// --- Utility ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Custom Player ---
const CustomPlayer = ({ 
    content, 
    movie,
    initialProgress = 0,
    onClose, 
    onProgressUpdate,
    onNext 
}: { 
    content: any, 
    movie: Content,
    initialProgress?: number,
    onClose: () => void, 
    onProgressUpdate?: (seconds: number) => void,
    onNext?: () => void,
    key?: any
}) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(initialProgress);
    const [iframeProgress, setIframeProgress] = useState(initialProgress); // Progress used for iframe URL
    const [isBuffering, setIsBuffering] = useState(true); // Initial buffer
    const [duration, setDuration] = useState(content.durationSeconds || movie.durationSeconds || 7810); 
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [playerKey, setPlayerKey] = useState(0); 
    const [showUpNext, setShowUpNext] = useState(false);
    const [upNextSeconds, setUpNextSeconds] = useState(0);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const upNextTriggerSeconds = content.upNextTriggerSeconds || movie.upNextTriggerSeconds || 15;

    const nextEpisode = useMemo(() => {
        if (movie.type !== 'series' || !movie.seasons || !content.episode) return null;
        
        let currentSeasonNum = 1;
        movie.seasons.forEach(s => {
            if (s.episodes.some(e => e.title === content.title)) {
                currentSeasonNum = s.season;
            }
        });

        const currentSeason = movie.seasons.find(s => s.season === currentSeasonNum);
        if (!currentSeason) return null;

        const nextInSeason = currentSeason.episodes.find(e => e.episode === content.episode + 1);
        if (nextInSeason) return nextInSeason;

        const nextSeason = movie.seasons.find(s => s.season === currentSeasonNum + 1);
        if (nextSeason && nextSeason.episodes[0]) return nextSeason.episodes[0];

        return null;
    }, [movie, content]);

    // Update iframe when specific actions happen
    const reloadIframe = (newProgress: number) => {
        setIsBuffering(true);
        setIframeProgress(newProgress);
        setPlayerKey(prev => prev + 1);
        setTimeout(() => setIsBuffering(false), 1000); // Wait 1s for "loading"
    };

    // Initial load buffer
    useEffect(() => {
        const timer = setTimeout(() => setIsBuffering(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Handle volume/mute changes without jumping back in time
    const handleVolumeOrMuteChange = () => {
        setIframeProgress(progress);
        setPlayerKey(prev => prev + 1);
    };

    // Sync progress to parent frequently
    useEffect(() => {
        const interval = setInterval(() => {
            if (isPlaying && !isBuffering) {
                onProgressUpdate?.(progress);
            }
        }, 1000); 
        return () => clearInterval(interval);
    }, [isPlaying, isBuffering, progress, onProgressUpdate]);

    // Fade out controls
    useEffect(() => {
        const handleInteraction = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) setShowControls(false);
            }, 5000); // 5 seconds
        };

        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mousedown', handleInteraction);
        handleInteraction();

        return () => {
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    // Mock progress timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !isBuffering) {
            interval = setInterval(() => {
                setProgress(prev => {
                    const nextVal = prev + 1;
                    
                    // Trigger Up Next overlay
                    if (nextEpisode && !showUpNext && nextVal >= duration - upNextTriggerSeconds) {
                        setShowUpNext(true);
                        setUpNextSeconds(upNextTriggerSeconds);
                    }

                    // Auto-advance if Up Next is active and reaches duration
                    if (nextVal >= duration) {
                        if (nextEpisode) {
                            onNext?.();
                        } else {
                            setIsPlaying(false);
                        }
                        return duration;
                    }
                    return nextVal;
                });

                // Update countdown if active
                if (showUpNext) {
                    setUpNextSeconds(prev => Math.max(0, prev - 1));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isBuffering, duration, nextEpisode, showUpNext, upNextTriggerSeconds, onNext]);

    const formatSecondsToT = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSeek = (seconds: number) => {
        const clampedSeconds = Math.max(0, Math.min(duration, seconds));
        setProgress(clampedSeconds);
        onProgressUpdate?.(clampedSeconds); // Immediate save on seek
        reloadIframe(clampedSeconds);
    };

    const togglePlay = () => {
        const nextPlaying = !isPlaying;
        setIsPlaying(nextPlaying);
        // User requested reload on both play and pause
        reloadIframe(progress);
    };

    const getEmbedUrl = (url: string) => {
        let finalUrl = url;
        const timestamp = formatSecondsToT(iframeProgress);
        
        if (url.includes('vkvideo.ru')) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${separator}t=${timestamp}`;
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            finalUrl = `${finalUrl}${separator}start=${Math.floor(iframeProgress)}`;
        }

        const separator = finalUrl.includes('?') ? '&' : '?';
        return `${finalUrl}${separator}autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&mute=${(isMuted || volume === 0) ? 1 : 0}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
        >
            {/* The Video Embed */}
            <div className="absolute inset-0 w-full h-full">
                <iframe 
                    key={playerKey}
                    src={getEmbedUrl(content.embedUrl)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; encrypted-media; fullscreen"
                />
            </div>

            {/* Interaction Layer (transparent but catches clicks to toggle controls) */}
            <div 
                className="absolute inset-0 z-10" 
                onClick={() => setShowControls(true)}
            />

            {/* Custom Controls UI */}
            <AnimatePresence>
                {showUpNext && nextEpisode && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute bottom-32 right-6 z-50 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl w-72 md:w-80 shadow-2xl overflow-hidden"
                    >
                        <div className="flex gap-4 items-center">
                            <div className="relative w-24 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
                                <img src={nextEpisode.thumbnailUrl} alt={nextEpisode.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Play fill="white" className="text-white" size={16} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Következő rész</p>
                                <h4 className="text-sm font-bold text-white truncate leading-tight mb-1">
                                    {nextEpisode.episode}. {nextEpisode.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{nextEpisode.duration}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button 
                                onClick={() => onNext?.()}
                                className="flex-1 bg-white text-black h-9 rounded font-black text-xs hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Play fill="black" size={14} />
                                <span>Indítás most</span>
                            </button>
                            <button 
                                onClick={() => setShowUpNext(false)}
                                className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-red-600" style={{ width: `${(upNextSeconds / upNextTriggerSeconds) * 100}%`, transition: 'width 1s linear' }} />
                    </motion.div>
                )}

                {showControls && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-12 bg-gradient-to-t from-black/80 via-transparent to-black/60"
                        onClick={(e) => e.stopPropagation()} // Prevent closing controls when clicking UI
                    >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ArrowLeft size={32} className="text-white" />
                            </button>
                            <div className="flex flex-col items-center">
                                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight drop-shadow-lg">
                                    {movie.title}
                                </h2>
                                {movie.type === 'series' && content.episode && (
                                    <p className="text-sm font-medium text-neutral-400">
                                        {content.title}
                                    </p>
                                )}
                            </div>
                            <div className="w-12" /> {/* Spacer */}
                        </div>

                        {/* Center Controls */}
                        <div className="flex items-center justify-center gap-12 md:gap-24">
                            <button 
                                onClick={() => handleSeek(Math.max(0, progress - 10))}
                                className="group flex flex-col items-center gap-2"
                            >
                                <RotateCcw size={40} className="text-white group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white">10</span>
                            </button>
                            
                            <button 
                                onClick={togglePlay}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                            >
                                {isPlaying ? (
                                    <Pause size={64} fill="white" className="text-white" />
                                ) : (
                                    <Play size={64} fill="white" className="text-white ml-2" />
                                )}
                            </button>

                            <button 
                                onClick={() => handleSeek(Math.min(duration, progress + 10))}
                                className="group flex flex-col items-center gap-2"
                            >
                                <RotateCw size={40} className="text-white group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white">10</span>
                            </button>
                        </div>

                        {/* Bottom Bar */}
                        <div className="space-y-6">
                            {/* Progress bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration - progress)}</span>
                                </div>
                                <div className="relative w-full h-1 group cursor-pointer">
                                    <div className="absolute inset-0 bg-white/20 rounded-full" />
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
                                        style={{ width: `${(progress / duration) * 100}%` }}
                                    />
                                    <input 
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={progress}
                                        onChange={(e) => handleSeek(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div 
                                        className="absolute w-4 h-4 bg-red-600 rounded-full -top-1.5 shadow-lg border border-white/20 pointer-events-none"
                                        style={{ left: `${(progress / duration) * 100}%`, transform: 'translateX(-50%)' }}
                                    />
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-4 group relative">
                                        <button onClick={() => {
                                            setIsMuted(!isMuted);
                                            handleVolumeOrMuteChange();
                                        }}>
                                            {isMuted || volume === 0 ? <VolumeX size={28} className="text-white" /> : <Volume2 size={28} className="text-white" />}
                                        </button>
                                        <div className="overflow-hidden w-0 group-hover:w-24 transition-all duration-300">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="1" 
                                                step="0.01" 
                                                value={volume} 
                                                onChange={(e) => setVolume(Number(e.target.value))}
                                                onMouseUp={handleVolumeOrMuteChange}
                                                onTouchEnd={handleVolumeOrMuteChange}
                                                className="w-24 h-1 accent-white appearance-none bg-white/20 rounded-full cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    {movie.type === 'series' && nextEpisode && (
                                        <button 
                                            onClick={() => onNext?.()}
                                            className="flex items-center gap-2 text-white font-bold text-sm hover:text-red-500 transition-colors"
                                        >
                                            <SkipForward size={24} />
                                            <span>Köv. epizód</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-8">
                                    <button className="text-white font-bold text-sm">Webhelyek</button>
                                    <button className="text-white font-bold text-sm">Sebesség (1x)</button>
                                    <button onClick={() => {
                                        if (document.fullscreenElement) {
                                            document.exitFullscreen();
                                        } else {
                                            document.documentElement.requestFullscreen();
                                        }
                                    }}>
                                        <Maximize size={24} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const DraggableRow = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        const updateConstraints = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = containerRef.current.scrollWidth;
                setConstraints({
                    left: Math.min(0, containerWidth - contentWidth), 
                    right: 0
                });
            }
        };

        updateConstraints();
        window.addEventListener('resize', updateConstraints);
        const timer = setTimeout(updateConstraints, 500);
        
        return () => {
            window.removeEventListener('resize', updateConstraints);
            clearTimeout(timer);
        };
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

const EpisodeCard = ({ episode, onPlay, isActive }: { episode: Episode, onPlay: (content: any) => void, isActive?: boolean, [key: string]: any }) => {
    return (
        <div 
          className={cn(
            "flex gap-4 items-center p-3 rounded-xl cursor-pointer group transition-all duration-300",
            isActive ? "bg-white/10" : "hover:bg-white/5"
          )} 
          onClick={() => onPlay(episode)}
        >
            <div className="relative w-32 md:w-40 aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 shadow-lg border border-white/5">
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
  playingMovie,
  playingContent,
  progress
}: { 
  movie: Content, 
  onClose: () => void, 
  onToggleMyList: (movieId: string) => void, 
  isInMyList: boolean, 
  onPlay: (movie: Content, playbackItem?: any) => void, 
  isLiked: boolean,
  onToggleLike: (movieId: string) => void,
  profile: any,
  playingMovie?: Content | null,
  playingContent: any,
  progress?: any,
  key?: any
}) => {
    const [selectedSeason, setSelectedSeason] = useState(progress?.season || movie.seasons?.[0]?.season || 1);
    
    const currentTrailerUrl = useMemo(() => {
        if (movie.type === 'series' && movie.seasons) {
            const season = movie.seasons.find(s => s.season === selectedSeason);
            return season?.trailerUrl || movie.trailerUrl || movie.embedUrl;
        }
        return movie.trailerUrl || movie.embedUrl;
    }, [movie, selectedSeason]);

    const trailerEmbedUrl = useMemo(() => {
        if (!currentTrailerUrl) return null;
        const videoId = currentTrailerUrl.split('/').pop()?.split('?')[0];
        const separator = currentTrailerUrl.includes('?') ? '&' : '?';
        
        // Background trailer: auto-playing, muted, no controls, looping, and modest branding
        return `${currentTrailerUrl}${separator}autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1`;
    }, [currentTrailerUrl]);

    const handlePlayClick = () => {
        if (movie.type === 'series' && movie.seasons) {
            if (progress) {
                const season = movie.seasons.find(s => s.season === progress.season);
                const episode = season?.episodes.find(e => e.episode === progress.episode);
                if (episode) {
                    onPlay(movie, episode);
                    return;
                }
            }
            const episodes = movie.seasons.find(s => s.season === selectedSeason)?.episodes || movie.seasons[0].episodes;
            onPlay(movie, episodes[0]);
        } else {
            onPlay(movie);
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black overflow-y-auto no-scrollbar"
        >
            <div className="relative w-full aspect-video bg-black overflow-hidden">
                {trailerEmbedUrl ? (
                    <div className="w-full h-full relative scale-125 pt-[56.25%] overflow-hidden pointer-events-none">
                        <iframe 
                            src={trailerEmbedUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; fullscreen"
                        />
                    </div>
                ) : (
                    <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                
                <button 
                  onClick={onClose}
                  className="absolute top-12 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10"
                >
                    <ArrowLeft className="text-white" size={24}/>
                </button>
            </div>

            <div className="relative z-10 p-6 space-y-6">
                <div>
                   <div className="flex items-center gap-2 h-6 mb-2">
                    <img src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" className="h-6 w-auto" alt="Netflix" />
                    <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase mt-0.5">
                      {movie.type === 'series' ? 'sorozat' : 'film'}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-4">
                    {movie.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm font-bold text-neutral-400">
                      <span>{movie.year}</span>
                      <span className="bg-neutral-800 rounded px-1.5 py-0.5 text-[10px] text-white">16+</span>
                      <span>{movie.duration}</span>
                      <span className="border border-neutral-700 px-1 py-0.5 text-[8px] rounded uppercase font-black">HDR10+</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    className="h-12 w-full bg-white text-black rounded-lg flex items-center justify-center font-black transition-all active:scale-[0.98] hover:bg-neutral-200" 
                    onClick={handlePlayClick}
                  >
                      <Play size={24} className="mr-2 fill-black" />
                      <span className="text-sm">
                        {progress ? 'Folytatás' : 'Lejátszás'}
                      </span>
                  </button>
                  <button className="h-12 w-full bg-neutral-800/90 text-white rounded-lg flex items-center justify-center font-black transition-all active:scale-[0.98] hover:bg-neutral-700">
                      <Download size={22} className="mr-2" />
                      <span className="text-sm">Letöltés</span>
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-white font-medium">
                  {movie.description}
                </p>

                <div className="text-sm space-y-1">
                  <p><span className="text-neutral-500 font-medium">Főszerepben:</span> <span className="text-neutral-300">{movie.cast.join(', ')}</span></p>
                  <p><span className="text-neutral-500 font-medium">Műfaj:</span> <span className="text-neutral-300">{movie.genres.join(', ')}</span></p>
                </div>

                <div className="flex justify-around py-4 border-y border-white/10">
                    <button onClick={() => onToggleMyList(movie.id)} className="flex flex-col items-center gap-2">
                        {isInMyList ? <Check size={28} className="text-white" /> : <Plus size={28} className="text-neutral-400" />}
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Saját</span>
                    </button>
                    <button onClick={() => onToggleLike(movie.id)} className="flex flex-col items-center gap-2">
                        <ThumbsUp size={24} className={isLiked ? "text-white fill-white" : "text-neutral-400"} />
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Értékelés</span>
                    </button>
                    <button className="flex flex-col items-center gap-2">
                        <Share2 size={24} className="text-neutral-400" />
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Megosztás</span>
                    </button>
                </div>

                {movie.type === 'series' && movie.seasons && (
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white tracking-tight">Epizódok</h3>
                            <div className="relative">
                              <select 
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                                className="bg-neutral-800 px-4 py-2 rounded-lg text-sm font-bold appearance-none pr-10 cursor-pointer border border-white/10"
                              >
                                {movie.seasons.map(s => (
                                  <option key={s.season} value={s.season}>{s.season}. évad</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            {movie.seasons.find(s => s.season === selectedSeason)?.episodes.map((episode) => (
                                <EpisodeCard 
                                  key={`episode-${movie.id}-${selectedSeason}-${episode.episode}-${episode.title}`} 
                                  episode={episode} 
                                  onPlay={(item) => onPlay(movie, item)} 
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

const MovieCard = ({ 
    movie, 
    onSelect, 
    onPlay,
    onOpenInfo,
    isContinueWatching, 
    progress,
    idx 
}: { 
    movie: Content, 
    onSelect: (movie: Content) => void, 
    onPlay?: (movie: Content, playbackItem?: any) => void,
    onOpenInfo?: (movie: Content) => void,
    isContinueWatching?: boolean, 
    progress?: any,
    idx?: number,
    [key: string]: any
}) => (
    <motion.div 
        layoutId={`movie-card-${movie.id}-${isContinueWatching ? 'cont' : 'grid'}`}
        onClick={() => isContinueWatching && onPlay ? onPlay(movie) : onSelect(movie)} 
        className={cn(
          "flex-shrink-0 relative rounded-lg overflow-hidden cursor-pointer group shadow-2xl transition-all w-[150px] md:w-[200px] aspect-[10/16] bg-neutral-900 border border-white/5",
          "hover:scale-[1.02] active:scale-[0.98]"
        )}
    >
        <img 
            src={movie.imageUrl} 
            alt={movie.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        
        {/* N Logo Corner Badge */}
        <div className="absolute top-2 left-2 z-10">
            <img src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" className="h-6 md:h-8 w-auto drop-shadow-lg" alt="N" />
        </div>

        {isContinueWatching ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-4 px-3">
                <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-[13px] font-black text-white truncate leading-tight tracking-tight drop-shadow-md">
                            {movie.title}
                        </p>
                        {movie.type === 'series' && progress && (
                            <p className="text-[10px] font-bold text-neutral-400 mt-0.5">
                                {progress.season}. évad {progress.episode}. rész
                            </p>
                        )}
                    </div>
                    <motion.button 
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            onOpenInfo?.(movie); 
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,1)", color: "black" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center text-white transition-all shadow-2xl hover:border-white focus:outline-none"
                        title="Információ"
                    >
                        <span className="font-serif italic text-xl font-bold leading-none mt-0.5">i</span>
                    </motion.button>
                </div>
            </div>
        ) : (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 pt-12">
                <h4 className="text-[11px] md:text-sm font-bold text-white leading-tight drop-shadow-2xl line-clamp-2">
                    {movie.title}
                </h4>
                {movie.isOriginal && (
                   <div className="flex items-center mt-1.5 gap-1.5 opacity-90">
                       <span className="text-[7px] font-black bg-red-600 text-white px-1 py-0 px-0.5 rounded-sm">N</span>
                       <p className="text-[7px] font-black text-neutral-300 uppercase tracking-widest">Eredeti</p>
                   </div>
                )}
            </div>
        )}
    </motion.div>
);

const SearchOverlay = ({ onClose, onSelect, onPlay }: { onClose: () => void, onSelect: (movie: Content) => void, onPlay: (movie: Content) => void }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Content[]>([]);

    const recommendations = useMemo(() => [...movieDB].sort(() => 0.5 - Math.random()).slice(0, 15), []);

    const handleSearch = (q: string) => {
        setQuery(q);
        if (q.trim().length > 1) {
            setResults(movieDB.filter(m => m.title.toLowerCase().includes(q.toLowerCase())));
        } else {
            setResults([]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-black flex flex-col"
        >
            <div className="pt-12 px-4 pb-4 flex items-center gap-4 bg-black">
                <div className="flex-1 bg-neutral-800 rounded-lg flex items-center px-4 py-2">
                  <Search size={20} className="text-neutral-400 mr-3" />
                  <input 
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Sorozatok, filmek, játékok..."
                      className="bg-transparent border-none text-white text-[15px] focus:outline-none w-full placeholder:text-neutral-500 font-medium"
                      autoFocus
                  />
                  {query && <X size={20} className="text-neutral-400 cursor-pointer" onClick={() => handleSearch("")} />}
                </div>
                <button onClick={onClose} className="text-white font-bold text-sm">Mégse</button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                {results.length > 0 ? (
                    <div className="px-4 space-y-4 pt-4">
                        <h3 className="font-black text-xl text-white mb-4 tracking-tight">Találatok</h3>
                        {results.map(movie => (
                            <div key={movie.id} onClick={() => onSelect(movie)} className="flex items-center gap-4 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="relative w-32 aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5">
                                    <img src={movie.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="flex-1 text-sm font-bold text-white truncate">{movie.title}</span>
                                <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center active:scale-90 transition-transform">
                                    <Play size={20} className="text-white fill-white ml-0.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                  <div className="px-4 space-y-6 pt-4">
                    <h3 className="font-black text-xl text-white tracking-tight">Legjobb találatok</h3>
                    <div className="space-y-4">
                        {recommendations.map(m => (
                          <div key={m.id} onClick={() => onSelect(m)} className="flex items-center gap-4 group cursor-pointer">
                            <div className="relative w-32 aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5">
                                <img src={m.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="flex-1 text-sm font-bold text-white truncate">{m.title}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPlay(m); }}
                                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <Play size={20} className="text-white fill-white ml-0.5" />
                            </button>
                          </div>
                        ))}
                    </div>
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
            className="absolute inset-0 z-[150] bg-black flex flex-col"
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

export default function NetflixApp({ onClose, user, onPlaybackChange }: { onClose: () => void, user: any, onPlaybackChange?: (playing: boolean) => void }) {
    const [profile, setProfile] = useState<any>(null);
    const [netflixData, setNetflixData] = useState<any>({ continueWatching: {} });
    const [selectedMovie, setSelectedMovie] = useState<Content | null>(null);
    const [playingMovie, setPlayingMovie] = useState<Content | null>(null);
    const [playingContent, setPlayingContent] = useState<any>(null);
    const [startTimeOverride, setStartTimeOverride] = useState<number | null>(null);

    useEffect(() => {
        onPlaybackChange?.(!!playingContent);
    }, [playingContent, onPlaybackChange]);

    const [activeTab, setActiveTab] = useState<'home' | 'mynetflix'>('home');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isMyListOpen, setMyListOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainScrollRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (mainScrollRef.current) mainScrollRef.current.scrollTo(0, 0);
    }, [activeTab, activeCategory, selectedMovie === null]);

    useEffect(() => {
      if (!user) return;
      const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        if (snap.exists()) setProfile(snap.data());
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });

      const unsubData = onSnapshot(doc(db, 'users', user.uid, 'appData', 'netflix'), (snap) => {
        if (snap.exists()) setNetflixData(snap.data());
      });

      return () => {
        unsubProfile();
        unsubData();
      };
    }, [user]);

    const saveProgress = async (movie: Content, episode?: Episode, seconds?: number) => {
      if (!user) return;
      const dataRef = doc(db, 'users', user.uid, 'appData', 'netflix');
      
      const now = Date.now();
      const movieRef = `continueWatching.${movie.id}`;
      const existingMovieProgress = netflixData.continueWatching?.[movie.id];
      
      let updateData: any = {
          [`${movieRef}.lastWatched`]: now,
          [`${movieRef}.type`]: movie.type,
      };

      if (movie.type === 'movie') {
          updateData[`${movieRef}.seconds`] = seconds !== undefined ? seconds : (existingMovieProgress?.seconds || 0);
      } else if (movie.type === 'series' && episode) {
          let seasonNum = 1;
          movie.seasons?.forEach(s => {
              if (s.episodes.some(e => e.embedUrl === episode.embedUrl)) {
                  seasonNum = s.season;
              }
          });
          
          const epKey = `s${seasonNum}_e${episode.episode}`;
          updateData[`${movieRef}.lastSeason`] = seasonNum;
          updateData[`${movieRef}.lastEpisode`] = episode.episode;
          updateData[`${movieRef}.episodes.${epKey}.seconds`] = seconds !== undefined ? seconds : (existingMovieProgress?.episodes?.[epKey]?.seconds || 0);
          updateData[`${movieRef}.episodes.${epKey}.lastWatched`] = now;
      }

      try {
        await updateDoc(dataRef, updateData);
      } catch (err) {
        // If document doesn't exist, create it with setDoc
        const initialProgress: any = {
            type: movie.type,
            lastWatched: now,
        };
        if (movie.type === 'movie') {
            initialProgress.seconds = seconds || 0;
        } else if (movie.type === 'series' && episode) {
            let seasonNum = 1;
            movie.seasons?.forEach(s => {
                if (s.episodes.some(e => e.embedUrl === episode.embedUrl)) {
                    seasonNum = s.season;
                }
            });
            const epKey = `s${seasonNum}_e${episode.episode}`;
            initialProgress.lastSeason = seasonNum;
            initialProgress.lastEpisode = episode.episode;
            initialProgress.episodes = {
                [epKey]: { seconds: seconds || 0, lastWatched: now }
            };
        }
        await setDoc(dataRef, { continueWatching: { [movie.id]: initialProgress } }, { merge: true });
      }
    };

    const handlePlay = (movie: Content, playbackItem?: any, forceSeconds?: number) => {
        setPlayingMovie(movie);
        
        let initialSecs = 0;
        const movieProgress = netflixData.continueWatching?.[movie.id];

        if (forceSeconds !== undefined) {
            initialSecs = forceSeconds;
        } else if (movieProgress) {
            if (movie.type === 'movie') {
                initialSecs = movieProgress.seconds || 0;
            } else if (playbackItem) {
                // Find season number for this episode
                let seasonNum = 1;
                movie.seasons?.forEach(s => {
                    if (s.episodes.some(e => e.embedUrl === (playbackItem as Episode).embedUrl)) {
                        seasonNum = s.season;
                    }
                });
                const epKey = `s${seasonNum}_e${(playbackItem as Episode).episode}`;
                initialSecs = movieProgress.episodes?.[epKey]?.seconds || 0;
            } else {
                // Series clicked without specific episode, find last watched
                const sNum = movieProgress.lastSeason || 1;
                const eNum = movieProgress.lastEpisode || 1;
                const epKey = `s${sNum}_e${eNum}`;
                initialSecs = movieProgress.episodes?.[epKey]?.seconds || 0;
            }
        }

        setStartTimeOverride(initialSecs);

        if (playbackItem && (playbackItem as Episode).embedUrl) {
            setPlayingContent(playbackItem);
            saveProgress(movie, playbackItem as Episode, initialSecs);
        } else if (movie.embedUrl) {
            setPlayingContent(movie);
            saveProgress(movie, undefined, initialSecs);
        } else if (movie.type === 'series') {
            // Find last progress or start S1E1
            let targetEpisode: Episode | undefined;
            
            if (movieProgress && movie.seasons) {
                const sNum = movieProgress.lastSeason || 1;
                const eNum = movieProgress.lastEpisode || 1;
                const season = movie.seasons.find(s => s.season === sNum);
                targetEpisode = season?.episodes.find(e => e.episode === eNum);
            }
            
            if (!targetEpisode && movie.seasons?.[0]?.episodes?.[0]) {
                targetEpisode = movie.seasons[0].episodes[0];
            }
            
            if (targetEpisode) {
                setPlayingContent(targetEpisode);
                saveProgress(movie, targetEpisode, initialSecs);
            }
        }
    };

    const handlePlayNext = useCallback(() => {
        if (!playingMovie || !playingContent || playingMovie.type !== 'series' || !playingMovie.seasons) return;
        
        let currentSeasonNum = 1;
        playingMovie.seasons.forEach(s => {
            if (s.episodes.some(e => e.title === playingContent.title)) {
                currentSeasonNum = s.season;
            }
        });
        
        const currentSeason = playingMovie.seasons.find(s => s.season === currentSeasonNum);
        const nextInSeason = currentSeason?.episodes.find(e => e.episode === playingContent.episode + 1);
        
        if (nextInSeason) {
            handlePlay(playingMovie, nextInSeason); // Don't force 0, let it resume if progress exists
        } else {
            const nextSeason = playingMovie.seasons.find(s => s.season === currentSeasonNum + 1);
            if (nextSeason && nextSeason.episodes[0]) {
                handlePlay(playingMovie, nextSeason.episodes[0]); // Don't force 0
            }
        }
    }, [playingMovie, playingContent, handlePlay]);

    const handleToggleMyList = async (movieId: string) => {
      if (!user || !profile) return;
      const currentList = profile.netflixMyList || [];
      const newList = currentList.includes(movieId) 
        ? currentList.filter((id: string) => id !== movieId)
        : [...currentList, movieId];
      try {
        await updateDoc(doc(db, 'users', user.uid), { netflixMyList: newList });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    };

    const handleToggleLike = async (movieId: string) => {
      if (!user || !profile) return;
      const liked = profile.netflixLikedContent || [];
      const newList = liked.includes(movieId)
        ? liked.filter((id: string) => id !== movieId)
        : [...liked, movieId];
      try {
        await updateDoc(doc(db, 'users', user.uid), { netflixLikedContent: newList });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    };

    const sections = useMemo(() => {
        const base = activeCategory === 'Sorozatok' ? movieDB.filter(m => m.type === 'series')
                 : activeCategory === 'Filmek' ? movieDB.filter(m => m.type === 'movie')
                 : movieDB;
        return Object.values(GENRES).map(title => ({
            title,
            movies: base.filter(m => m.genres.includes(title))
        })).filter(s => s.movies.length > 0);
    }, [activeCategory]);

    const continueWatchingList = useMemo(() => {
        const history = netflixData.continueWatching || {};
        const sortedIds = Object.keys(history).sort((a, b) => history[b].lastWatched - history[a].lastWatched);
        
        return sortedIds.map(id => {
            const movie = movieDB.find(m => m.id === id);
            if (!movie) return null;
            
            const data = history[id];
            let progress = 0;
            
            if (movie.type === 'movie' && movie.durationSeconds) {
                progress = (data.seconds / movie.durationSeconds) * 100;
            } else if (movie.type === 'series') {
                const sNum = data.lastSeason || 1;
                const eNum = data.lastEpisode || 1;
                const epKey = `s${sNum}_e${eNum}`;
                const episode = movie.seasons?.find(s => s.season === sNum)?.episodes.find(e => e.episode === eNum);
                const epSeconds = data.episodes?.[epKey]?.seconds || 0;
                
                if (episode?.durationSeconds) {
                    progress = (epSeconds / episode.durationSeconds) * 100;
                }
            }
            
            return { ...movie, progress };
        }).filter(Boolean) as (Content & { progress: number })[];
    }, [netflixData]);

    const likedContent = useMemo(() => movieDB.filter(m => (profile?.netflixLikedContent || []).includes(m.id)), [profile]);
    const myListMovies = useMemo(() => movieDB.filter(m => profile ? (profile.netflixMyList || []).includes(m.id) : []), [profile]);

    const featuredMovie = useMemo(() => {
        const list = activeCategory === 'Sorozatok' ? movieDB.filter(m => m.type === 'series')
                   : activeCategory === 'Filmek' ? movieDB.filter(m => m.type === 'movie')
                   : movieDB;
        return list[Math.floor(Math.random() * list.length)] || movieDB[0];
    }, [activeCategory]);

    if (!profile) return (
      <div className="flex h-full items-center justify-center bg-black">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#141414] text-white overflow-hidden relative font-sans">
            <AnimatePresence mode="wait">
                {playingContent && playingMovie && (
                    <CustomPlayer 
                        key={`player-${playingMovie.id}-${playingContent.episode || 'movie'}`}
                        movie={playingMovie}
                        content={playingContent}
                        initialProgress={startTimeOverride !== null ? startTimeOverride : (netflixData.continueWatching?.[playingMovie.id]?.seconds || 0)}
                        onClose={() => {
                            setPlayingContent(null);
                            setStartTimeOverride(null);
                        }}
                        onProgressUpdate={(seconds) => { 
                            if (playingMovie) {
                                saveProgress(playingMovie, playingMovie.type === 'series' ? playingContent : undefined, seconds); 
                            }
                        }}
                        onNext={handlePlayNext}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {selectedMovie && (
                    <MovieDetailView 
                        key={`detail-${selectedMovie.id}`}
                        movie={selectedMovie} 
                        onClose={() => setSelectedMovie(null)}
                        onToggleMyList={handleToggleMyList}
                        isInMyList={(profile.netflixMyList || []).includes(selectedMovie.id)}
                        onPlay={handlePlay}
                        onToggleLike={handleToggleLike}
                        isLiked={(profile.netflixLikedContent || []).includes(selectedMovie.id)}
                        profile={profile}
                        playingMovie={playingMovie}
                        playingContent={playingContent}
                        progress={netflixData.continueWatching?.[selectedMovie.id]}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSearchOpen && (
                    <SearchOverlay 
                        onClose={() => setSearchOpen(false)} 
                        onSelect={(m) => { setSelectedMovie(m); setSearchOpen(false); }} 
                        onPlay={(m) => { handlePlay(m); setSearchOpen(false); }}
                    />
                )}
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

            {/* Header */}
            <header className={cn(
              "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
              scrolled || activeCategory ? 'bg-black/90 backdrop-blur-xl' : 'bg-transparent'
            )}>
                <div className="flex items-center justify-between px-6 pt-12 pb-4">
                    <div className="flex items-center gap-4">
                      {activeCategory ? (
                        <button onClick={() => setActiveCategory(null)} className="active:scale-75 transition-transform">
                            <ArrowLeft size={28} className="text-white" />
                        </button>
                      ) : (
                        <img 
                            src="https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png" 
                            className="h-10 w-auto cursor-pointer" 
                            onClick={() => { setActiveTab('home'); setActiveCategory(null); }}
                            alt="Netflix" 
                        />
                      )}
                      <h1 className="text-xl font-bold tracking-tight text-white/90">{activeCategory || 'Netflix'}</h1>
                    </div>
                    <div className="flex items-center gap-5">
                      <Download size={24} className="text-white/80 active:scale-90 transition-transform" />
                      <div className="relative cursor-pointer active:scale-90 transition-transform">
                        <Bell size={24} className="text-white/80" />
                        <div className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center">3</div>
                      </div>
                    </div>
                </div>
                {!activeCategory && (
                    <div className="flex gap-3 px-6 py-2 overflow-x-auto no-scrollbar">
                        {['Sorozatok', 'Filmek', 'Játékok', 'Új'].map((chip, i) => (
                           <button 
                             key={i} 
                             onClick={() => setActiveCategory(chip)}
                             className="px-5 py-2 border border-white/20 rounded-full text-sm font-bold bg-neutral-800/60 backdrop-blur-md whitespace-nowrap active:scale-95 transition-transform"
                           >
                             {chip}
                           </button>
                        ))}
                    </div>
                )}
            </header>

            <main ref={mainScrollRef as any} className="flex-1 overflow-y-auto no-scrollbar" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 50)}>
                {activeTab === 'home' ? (
                  <>
                    <section className={cn("px-4 relative", activeCategory ? "pt-28" : "pt-48")}>
                      <div 
                        className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border border-white/10 aspect-[3/4]" 
                        onClick={() => setSelectedMovie(featuredMovie)}
                      >
                        <img src={featuredMovie.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="hero" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/20" />
                        <div className="absolute bottom-8 left-0 right-0 px-6 flex flex-col items-center gap-6">
                          <h1 className="text-4xl md:text-5xl font-black text-white text-center tracking-tighter uppercase italic drop-shadow-2xl">
                            {featuredMovie.title}
                          </h1>
                          <div className="flex gap-4 w-full">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handlePlay(featuredMovie); }}
                                className="flex-1 h-12 bg-white text-black rounded-lg font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Play size={22} fill="black" /> Lejátszás
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleMyList(featuredMovie.id); }}
                                className="flex-1 h-12 bg-neutral-800/80 text-white rounded-lg font-black flex items-center justify-center gap-2 backdrop-blur-xl active:scale-95 transition-transform"
                            >
                                <Plus size={22} /> Saját listám
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="space-y-12 px-6 mt-12 pb-40">
                        {continueWatchingList.length > 0 && !activeCategory && (
                            <section key="continue-watching-section" className="space-y-4">
                                <h3 className="text-xl font-bold tracking-tight text-white/90">Nézd tovább, {profile?.settings?.displayName || profile?.displayName || 'Felhasználó'}</h3>
                                <DraggableRow>
                                    {continueWatchingList.map((movie, i) => (
                                        <MovieCard 
                                            key={movie.id} 
                                            movie={movie} 
                                            onSelect={setSelectedMovie} 
                                            onPlay={handlePlay}
                                            onOpenInfo={setSelectedMovie}
                                            isContinueWatching 
                                            progress={netflixData.continueWatching?.[movie.id]}
                                            idx={i} 
                                        />
                                    ))}
                                </DraggableRow>
                            </section>
                        )}

                        {sections.map((section) => (
                            <section key={`section-${section.title}`} className="space-y-4">
                                <h3 className="text-xl font-bold tracking-tight text-white/90">{section.title}</h3>
                                <DraggableRow>
                                  {section.movies.map((m, mIdx) => (
                                    <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} onPlay={handlePlay} onOpenInfo={setSelectedMovie} idx={mIdx} />
                                  ))}
                                </DraggableRow>
                            </section>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="px-6 pt-32 pb-40 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-lg bg-blue-600 overflow-hidden mb-4 shadow-2xl border-2 border-white/20">
                          <img src={profile?.settings?.photoURL} className="w-full h-full object-cover" alt="profile" />
                      </div>
                      <h2 className="text-2xl font-bold mb-8">{profile?.settings?.displayName}</h2>
                      
                      <div className="w-full space-y-10">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Saját lista</h3>
                                <button onClick={() => setMyListOpen(true)} className="text-sm font-bold text-neutral-400 flex items-center">
                                    Összes <ChevronRight size={16} />
                                </button>
                            </div>
                            <DraggableRow>
                                {myListMovies.map(m => (
                                    <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} onPlay={handlePlay} onOpenInfo={setSelectedMovie} />
                                ))}
                            </DraggableRow>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold">Értékelt tartalom</h3>
                            <DraggableRow>
                                {likedContent.map(m => (
                                    <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} onPlay={handlePlay} onOpenInfo={setSelectedMovie} />
                                ))}
                            </DraggableRow>
                        </section>

                        <div className="w-full space-y-6 pt-10">
                            <h3 className="text-xl font-bold">Kezelés</h3>
                            <div className="grid gap-2">
                                {['Értesítések', 'Saját lista', 'Értékelt tartalom'].map(item => (
                                    <div key={item} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                                        <span className="font-bold">{item}</span>
                                        <ChevronRight size={20} className="text-neutral-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                  </div>
                )}
            </main>
            
            <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-4 pb-6 z-50 shadow-2xl">
                <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-white scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <Home size={26} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Kezdőoldal</span>
                </button>
                <button 
                    onClick={() => setSearchOpen(true)}
                    className="flex flex-col items-center gap-1.5 text-neutral-500 hover:text-neutral-300 active:scale-95 transition-transform"
                >
                    <Search size={26} />
                    <span className="text-[10px] font-bold">Keresés</span>
                </button>
                <button onClick={() => setActiveTab('mynetflix')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'mynetflix' ? 'text-white scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <div className="w-7 h-7 rounded bg-blue-600 overflow-hidden mb-0.5 relative shadow-lg">
                       <img src={profile?.settings?.photoURL} className="w-full h-full object-cover" alt="p" />
                    </div>
                    <span className="text-[10px] font-bold">Profil</span>
                </button>
            </nav>
        </div>
    )
}
