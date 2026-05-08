import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus, 
  Info, 
  Search, 
  Download, 
  Home, 
  Gamepad2, 
  Tv, 
  User, 
  Check, 
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  PlusCircle,
  PlayCircle
} from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  image: string;
  badge?: string;
  isTop10?: boolean;
}

const NETFLIX_RED = '#E50914';

const FEATURED_MOVIE = {
  title: "Stranger Things",
  image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
  tags: ["Sci-Fi", "Rejtély", "Thriller"],
  description: "Egy kisfiú eltűnik, és kisvárosa titkos kísérleteket tartalmazó rejtélyt fed fel."
};

const CATEGORIES = ["Sorozatok", "Filmek", "Kategóriák"];

const ROW_DATA: { [key: string]: Movie[] } = {
  "Trendi mostanában": [
    { id: '1', title: 'Extraction 2', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop' },
    { id: '2', title: 'The Witcher', image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1935&auto=format&fit=crop', badge: 'Top 10' },
    { id: '3', title: 'Squid Game', image: 'https://images.unsplash.com/photo-1627873649417-c67f701f1949?q=80&w=2070&auto=format&fit=crop' },
    { id: '4', title: 'Wednesday', image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop' },
  ],
  "Top 10 Magyarországon ma": [
    { id: '5', title: 'Dark', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop', isTop10: true },
    { id: '6', title: 'Elite', image: 'https://images.unsplash.com/photo-1542204172-3c1f81d05d82?q=80&w=1935&auto=format&fit=crop', isTop10: true },
    { id: '7', title: 'Money Heist', image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop', isTop10: true },
  ],
  "Saját listám": [
    { id: '8', title: 'Black Mirror', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop' },
    { id: '9', title: 'Lupin', image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1937&auto=format&fit=crop' },
  ]
};

const NetflixApp: React.FC<{ onClose: () => void; user: any }> = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [muted, setMuted] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 50);
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden relative font-sans">
      {/* Top Header Overlay */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'}`}>
        <div className="flex items-center justify-between px-6 pt-12 pb-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" 
            alt="Netflix" 
            className="h-7 w-auto"
          />
          <div className="flex items-center gap-6">
            <Search size={22} className="cursor-pointer" />
            <div className="w-8 h-8 rounded bg-blue-500 overflow-hidden cursor-pointer border border-white/20" onClick={onClose}>
              <img src={user?.photoURL || 'https://i.pravatar.cc/100?img=12'} alt="p" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {!scrolled && (
          <div className="overflow-hidden">
            <motion.div 
              drag="x"
              dragConstraints={{ left: -150, right: 0 }}
              dragElastic={0.1}
              className="flex justify-center gap-8 py-2 text-sm font-bold pb-4 cursor-grab active:cursor-grabbing w-max mx-auto px-10"
            >
              {CATEGORIES.map(cat => (
                <button key={cat} className="hover:text-gray-300 transition-colors uppercase tracking-tight whitespace-nowrap">{cat}</button>
              ))}
            </motion.div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar pb-24"
        onScroll={handleScroll}
      >
        {/* Hero Section */}
        <section className="relative h-[80vh] w-full flex flex-col justify-end pb-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={FEATURED_MOVIE.image} 
              alt="Feature" 
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
          </div>

          <div className="relative z-10 px-6 space-y-6">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 text-[10px] font-black px-2 py-0.5 rounded-sm tracking-widest uppercase">Eredeti sorozat</div>
            </div>
            
            <h1 className="text-5xl font-black text-center tracking-tighter leading-none mb-4 italic">
              STRANGER<br />THINGS
            </h1>

            <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-200">
              {FEATURED_MOVIE.tags.map((tag, i) => (
                <React.Fragment key={tag}>
                  <span>{tag}</span>
                  {i < FEATURED_MOVIE.tags.length - 1 && <div className="w-1 h-1 rounded-full bg-gray-500" />}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center justify-center gap-10 mt-8">
              <div className="flex flex-col items-center gap-1 cursor-pointer group">
                <Plus size={28} />
                <span className="text-[10px] font-bold">Listám</span>
              </div>

              <button className="flex items-center justify-center gap-2 bg-white text-black px-10 py-2.5 rounded font-bold text-lg active:scale-95 transition-transform">
                <Play size={24} fill="black" />
                Lejátszás
              </button>

              <div className="flex flex-col items-center gap-1 cursor-pointer group">
                <Info size={28} />
                <span className="text-[10px] font-bold">Infó</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setMuted(!muted)}
            className="absolute bottom-16 right-6 p-2 rounded-full border border-white/40 bg-black/20"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </section>

        {/* Content Rows */}
        <div className="space-y-10 px-4 -mt-10 relative z-20">
          {Object.entries(ROW_DATA).map(([title, movies]) => (
            <div key={title} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
              <div className="overflow-hidden -mx-4 px-4">
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: -600, right: 0 }}
                  dragElastic={0.05}
                  className="flex gap-3 cursor-grab active:cursor-grabbing w-max mb-4"
                >
                  {movies.map((movie) => (
                    <motion.div 
                      key={movie.id}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 relative group"
                    >
                      <div className="w-[140px] md:w-[180px] aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg">
                        <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                        {movie.isTop10 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-[10px] font-black p-1 leading-none rounded-sm">
                            TOP<br/>10
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar Mobile Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-3xl border-t border-white/5 px-4 pt-3 pb-8 z-[60]">
        <div className="flex items-center justify-around">
          {[
            { id: 'home', icon: Home, label: 'Kezdőlap' },
            { id: 'games', icon: Gamepad2, label: 'Játékok' },
            { id: 'new', icon: Tv, label: 'Új és népszerű' },
            { id: 'downloads', icon: Download, label: 'Letöltések' },
            { id: 'profile', icon: User, label: 'Saját Netflix' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeDot" className="w-1 h-1 bg-red-600 rounded-full mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default NetflixApp;
