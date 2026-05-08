import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Battery, Signal, Wifi, Search, 
  Settings as SettingsIcon, 
  ShoppingBag, Music, Play, 
  Globe, Facebook as FacebookIcon, 
  ChevronLeft, Home as HomeIcon,
  User as UserIcon, LogOut, Mail, Lock, 
  ArrowRight, Key
} from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { UserProfile, AppInfo, SYSTEM_APPS, AVAILABLE_APPS } from './types';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';
import NetflixApp from './components/apps/NetflixApp';
import SettingsApp from './components/apps/SettingsApp';

// Components
const StatusBar = ({ isAppActive }: { isAppActive: boolean }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] px-6 pt-3 pb-4 flex items-center justify-between transition-all duration-500 bg-gradient-to-b from-black/40 to-transparent pointer-events-none`}>
      <div className="text-white text-[12px] font-bold tracking-tight">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex items-center gap-3 text-white/90">
        <Wifi size={14} strokeWidth={2.5} />
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-[10px] tracking-tight">100%</span>
          <Battery size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

const Icon = ({ name, size = 24 }: { name: string, size?: number }) => {
  switch (name) {
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'Settings': return <SettingsIcon size={size} />;
    case 'Music': return <Music size={size} />;
    case 'Play': return <Play size={size} />;
    case 'Globe': return <Globe size={size} />;
    case 'Facebook': return <FacebookIcon size={size} />;
    default: return <SettingsIcon size={size} />;
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [showPlayStore, setShowPlayStore] = useState(false);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        try {
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              installedAppIds: [],
              settings: {
                wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
                theme: 'dark'
              }
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }

        const unsubDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) setProfile(doc.data() as UserProfile);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        });
        setLoading(false);
        return () => unsubDoc();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Hiba történt a hitelesítés során.');
    }
  };

  const installApp = async (appId: string) => {
    if (!user || !profile) return;
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, userPath);
    const updatedIds = [...profile.installedAppIds];
    if (!updatedIds.includes(appId)) {
      updatedIds.push(appId);
      try {
        await updateDoc(userRef, { installedAppIds: updatedIds });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    }
  };

  const uninstallApp = async (appId: string) => {
    if (!user || !profile) return;
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, userPath);
    const updatedIds = profile.installedAppIds.filter(id => id !== appId);
    try {
      await updateDoc(userRef, { installedAppIds: updatedIds });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-sans">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold tracking-[0.2em]"
        >
          SAMSUNG
        </motion.div>
      </div>
    );
  }

  const allVisibleApps = [
    ...SYSTEM_APPS.filter(app => app.id !== 'playstore'),
    ...AVAILABLE_APPS.filter(app => profile?.installedAppIds.includes(app.id))
  ];

  const isAppActive = !!activeApp || showPlayStore;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col font-sans selection:bg-blue-200 overflow-hidden text-white">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out scale-105"
        style={{
          backgroundImage: `url(${profile?.settings.wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isAppActive ? 'blur(0px) brightness(1.15)' : 'blur(0px)'
        }}
      />
      {!isAppActive && <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-0" />}

      {/* Main OS Container */}
      <div className="relative z-10 flex-1 flex flex-col h-full w-full">
        
        <StatusBar isAppActive={isAppActive} />

        <div className="flex-1 relative flex flex-col overflow-hidden w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center px-6"
              >
                <div className="w-full max-w-[420px] bg-black/60 backdrop-blur-3xl p-10 md:p-12 rounded-[40px] border border-white/10 shadow-2xl">
                  <div className="mb-10 text-center">
                    <motion.div 
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20"
                    >
                      <UserIcon size={32} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">S24 OS</h1>
                    <p className="text-zinc-400 text-sm font-medium">Jelentkezz be a folytatáshoz</p>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Jelszó"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] px-4 py-2.5 rounded-xl font-medium">
                        {authError}
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm"
                    >
                      {authMode === 'login' ? 'Belépés' : 'Fiók létrehozása'}
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  <div className="mt-8 flex items-center gap-4 text-zinc-800">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-600">VAGY</span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>

                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={() => signInWithGoogle()}
                      className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-white/10 hover:bg-white/20 transition-all active:scale-95 text-xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>

                    <button 
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      className="w-full text-zinc-500 py-2 text-xs font-bold hover:text-white transition-colors"
                    >
                      {authMode === 'login' ? 'Nincs fiókod? Regisztrálj!' : 'Van fiókod? Lépj be!'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : activeApp ? (
              <motion.div 
                key="app-view"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-[60] flex flex-col shadow-2xl overflow-hidden"
              >
                {activeApp.id === 'netflix' ? (
                  <NetflixApp onClose={() => setActiveApp(null)} user={user} />
                ) : activeApp.id === 'settings' ? (
                  <SettingsApp user={user} profile={profile} onClose={() => setActiveApp(null)} />
                ) : (
                  <>
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-zinc-50">
                      <div className="flex items-center gap-6">
                        <button onClick={() => setActiveApp(null)} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-900">
                          <ChevronLeft size={28} />
                        </button>
                        <span className="font-bold text-xl md:text-2xl text-zinc-900">{activeApp.name}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-100">
                        <img src={user.photoURL || 'https://i.pravatar.cc/100'} alt="me" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                      <motion.div 
                        layoutId={`app-icon-${activeApp.id}`}
                        className={`w-32 h-32 md:w-40 md:h-40 rounded-[36px] ${activeApp.color} flex items-center justify-center shadow-2xl`}
                      >
                        <Icon name={activeApp.icon} size={64} />
                      </motion.div>
                      <div className="mt-8 space-y-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight">{activeApp.name}</h2>
                        <p className="text-zinc-500 font-medium italic">{activeApp.description}</p>
                      </div>
                      <div className="mt-10 p-6 bg-zinc-50 rounded-[28px] w-full border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Felhasználói Fiók</p>
                        <p className="font-mono text-sm text-zinc-800 font-semibold">{user.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : showPlayStore ? (
              <motion.div 
                key="playstore"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="absolute inset-0 bg-zinc-50 z-[60] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="p-6 md:p-8 bg-white border-b border-zinc-200/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setShowPlayStore(false)} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                        <ChevronLeft size={28} />
                      </button>
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Play Áruház</h1>
                    </div>
                    <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg ring-1 ring-zinc-200" onClick={signOut}>
                      <img src={user.photoURL || 'https://i.pravatar.cc/100'} alt="profile" />
                    </button>
                  </div>
                  <div className="bg-zinc-100 rounded-2xl flex items-center px-5 py-3.5 gap-4">
                    <Search className="text-zinc-400" size={20} />
                    <input type="text" placeholder="Alkalmazások keresése..." className="bg-transparent border-none outline-none text-sm font-medium w-full text-zinc-950" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
                  <section>
                    <h3 className="font-bold text-xl mb-6 px-1 text-zinc-900">Népszerű alkalmazások</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {AVAILABLE_APPS.map(app => {
                        const isInstalled = profile?.installedAppIds.includes(app.id);
                        return (
                          <div key={app.id} className="bg-white p-5 rounded-[28px] flex items-center justify-between shadow-sm border border-zinc-100/50 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center shadow-lg shadow-black/5`}>
                                <Icon name={app.icon} size={28} />
                              </div>
                              <div>
                                <div className="font-bold text-base text-zinc-900">{app.name}</div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{app.category}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => isInstalled ? uninstallApp(app.id) : installApp(app.id)}
                              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                isInstalled 
                                ? 'bg-zinc-100 text-zinc-400' 
                                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              }`}
                            >
                              {isInstalled ? 'Törlés' : 'Telepítés'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col p-6 md:p-12 h-full relative"
              >
                <div className="relative z-10 flex flex-col h-full bg-transparent">
                  <div className="flex-1 mt-24 md:mt-28 bg-transparent overflow-y-auto no-scrollbar">
                    <div className="max-w-5xl mx-auto">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-x-4 gap-y-12">
                        <motion.div 
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPlayStore(true)}
                          className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                          <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-white rounded-xl md:rounded-[22px] flex items-center justify-center shadow-lg ring-1 ring-white/10 relative">
                            <ShoppingBag className="text-blue-500" size={28} strokeWidth={2.5} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-900" />
                          </div>
                          <span className="text-[10px] md:text-[11px] text-white font-bold text-shadow text-center">Áruház</span>
                        </motion.div>

                        {allVisibleApps.map(app => (
                          <motion.div 
                            key={app.id} 
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveApp(app)}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                          >
                            <motion.div 
                              layoutId={`app-icon-${app.id}`}
                              className={`w-[50px] h-[50px] md:w-[60px] md:h-[60px] ${app.color} rounded-xl md:rounded-[22px] flex items-center justify-center shadow-lg ring-1 ring-white/10`}
                            >
                              <Icon name={app.icon} size={28} />
                            </motion.div>
                            <span className="text-[10px] md:text-[11px] text-white font-bold text-shadow text-center truncate w-full px-1">{app.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 pt-6 flex justify-center">
                    <motion.div 
                      key="dock"
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-black/30 backdrop-blur-3xl rounded-[28px] px-5 py-2.5 flex justify-center items-center gap-5 border border-white/10 shadow-2xl w-fit"
                    >
                      <motion.div whileTap={{ scale: 0.85 }} className="w-11 h-11 md:w-13 md:h-13 bg-green-500 rounded-xl md:rounded-[20px] flex items-center justify-center shadow-lg cursor-pointer">
                        <Globe className="text-white" size={24} />
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.85 }} className="w-11 h-11 md:w-13 md:h-13 bg-[#1877F2] rounded-xl md:rounded-[20px] flex items-center justify-center shadow-lg cursor-pointer">
                        <FacebookIcon className="text-white" size={24} />
                      </motion.div>
                      <motion.div 
                        whileTap={{ scale: 0.85 }} 
                        className="w-11 h-11 md:w-13 md:h-13 bg-zinc-800 rounded-xl md:rounded-[20px] flex items-center justify-center shadow-lg cursor-pointer overflow-hidden border border-white/10"
                        onClick={() => setActiveApp(SYSTEM_APPS.find(a => a.id === 'settings') || null)}
                      >
                        {profile?.settings?.photoURL ? (
                          <img src={profile.settings.photoURL} className="w-full h-full object-cover" alt="p" />
                        ) : (
                          <UserIcon className="text-white" size={22} />
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Bar Indicator & Navigation */}
        <div className={`fixed bottom-0 left-0 right-0 h-6 md:h-10 flex justify-center items-end pb-1 md:pb-2 z-[70] transition-all duration-500 bg-gradient-to-t from-black/5 to-transparent pointer-events-none`}>
          <div className="relative w-full max-w-sm flex items-center justify-center gap-12 pointer-events-auto">
            {!isAppActive && (
               <div className="hidden md:flex bg-black/10 backdrop-blur-3xl rounded-full px-6 py-2 items-center gap-6 border border-white/5 shadow-2xl mb-8">
                <Globe size={20} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
                <div className="w-[1px] h-4 bg-white/10" />
                <FacebookIcon size={20} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
                <div className="w-[1px] h-4 bg-white/10" />
                <div 
                  className="w-8 h-8 rounded-full overflow-hidden border border-white/10 cursor-pointer"
                  onClick={() => setActiveApp(SYSTEM_APPS.find(a => a.id === 'settings') || null)}
                >
                  {profile?.settings?.photoURL ? (
                    <img src={profile.settings.photoURL} className="w-full h-full object-cover" alt="p" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <motion.div 
               whileTap={{ scale: 0.9 }}
               onClick={() => {
                 setActiveApp(null);
                 setShowPlayStore(false);
               }}
               className="w-14 md:w-20 h-1 bg-white/25 rounded-full cursor-pointer hover:bg-white/50 transition-colors"
            />
          </div>
        </div>
      </div>



      <style dangerouslySetInnerHTML={{ __html: `
        .text-shadow {
          text-shadow: 0 1px 8px rgba(0,0,0,0.5);
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
