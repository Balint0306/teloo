import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Users, Search, 
  Database, Shield, Mail, 
  Smartphone, ExternalLink,
  Lock, Eye, FileText, 
  ShoppingCart, ChefHat, Flame,
  Settings as SettingsIcon,
  RefreshCw, Power, Home
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile, AVAILABLE_APPS } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

// App Components for Simulator
import NotesApp from './NotesApp';
import ShoppingApp from './ShoppingApp';
import RecipeApp from './RecipeApp';
import PasswordsApp from './PasswordsApp';
import FlameApp from './FlameApp';
import SettingsApp from './SettingsApp';
import CalendarApp from './CalendarApp';
import WeatherApp from './WeatherApp';
import SpotifyApp from './SpotifyApp';

interface AdminAppProps {
  onClose: () => void;
  currentUser: any;
}

interface UserData extends UserProfile {
  id: string;
}

export default function AdminApp({ onClose, currentUser }: AdminAppProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'inspect' | 'view'>('users');
  const [inspectData, setInspectData] = useState<{
    passwords: any[];
    notes: any[];
    shopping: any[];
    recipes: any[];
  } | null>(null);

  // Simulator Specific State
  const [activeMiniAppId, setActiveMiniAppId] = useState<string | null>(null);

  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserData[];
        setUsers(docs);
        setLoading(false);
        setPermissionError(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const collections = ['passwords', 'notes', 'shoppingLists', 'recipes'];
      const data: any = {};
      
      for (const coll of collections) {
        const snapshot = await getDocs(collection(db, 'users', userId, coll));
        if (coll === 'shoppingLists') {
          const allItems: any[] = [];
          for (const listDoc of snapshot.docs) {
            const itemsSnap = await getDocs(collection(db, 'users', userId, 'shoppingLists', listDoc.id, 'items'));
            allItems.push(...itemsSnap.docs.map(d => ({ id: d.id, listName: listDoc.data().name, ...d.data() })));
          }
          data['shopping'] = allItems;
        } else {
          data[coll] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      }
      
      setInspectData(data);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/[collections]`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.uid?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to render the active application in the simulator
  const renderMiniApp = () => {
    if (!selectedUser || !activeMiniAppId) return null;
    
    // Create a shadow user object for the components
    const impersonatedUser = {
      uid: selectedUser.id,
      email: selectedUser.email,
      displayName: selectedUser.settings?.displayName,
      photoURL: selectedUser.settings?.photoURL
    } as any;

    const miniAppProps = {
      user: impersonatedUser,
      profile: selectedUser,
      onClose: () => setActiveMiniAppId(null)
    };

    switch (activeMiniAppId) {
      case 'notes': return <NotesApp {...miniAppProps} />;
      case 'shopping': return <ShoppingApp {...miniAppProps} />;
      case 'recipes': return <RecipeApp {...miniAppProps} />;
      case 'passwords': return <PasswordsApp {...miniAppProps} />;
      case 'flame': return <FlameApp {...miniAppProps} />;
      case 'settings': return <SettingsApp {...miniAppProps} />;
      case 'calendar': return <CalendarApp {...miniAppProps} />;
      case 'weather': return <WeatherApp {...miniAppProps} />;
      case 'spotify': return <SpotifyApp {...miniAppProps} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden text-zinc-100 font-sans">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-3 -ml-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-xl">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Shield className="text-amber-500" size={24} fill="currentColor" fillOpacity={0.2} />
                Admin Panel
              </h1>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 mt-0.5">
                Rendszergazdai felügyelet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / User List */}
        <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-zinc-900/20 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 gap-3">
              <Search size={18} className="text-zinc-500" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="User keresése..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          {permissionError ? (
            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
              <Shield className="text-red-500" size={32} />
              <p className="text-xs font-bold text-red-400">Nincs jogosultságod az adatok megtekintéséhez.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-2 no-scrollbar">
              {filteredUsers.map(u => (
                <button 
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    fetchUserData(u.id);
                    setActiveTab('users');
                    setActiveMiniAppId(null);
                  }}
                  className={`w-full p-4 rounded-2xl text-left transition-all border flex items-center gap-4 ${
                    selectedUser?.id === u.id 
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5' 
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                    {u.settings?.photoURL ? (
                      <img src={u.settings.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={18} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{u.email}</div>
                    <div className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter truncate">
                      ID: {u.uid?.slice(0, 8)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className={`flex-1 flex flex-col bg-[#050505] overflow-hidden ${!selectedUser ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {selectedUser ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* User Header */}
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 bg-white/5 rounded-xl">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-16 h-16 rounded-[24px] bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
                    {selectedUser.settings?.photoURL ? (
                      <img src={selectedUser.settings.photoURL} alt="" className="w-full h-full object-cover rounded-[24px]" />
                    ) : (
                      <Smartphone size={32} className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedUser.settings?.displayName || 'User'}</h2>
                    <p className="text-zinc-500 font-mono text-xs">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                  >
                    Profil
                  </button>
                  <button 
                    onClick={() => setActiveTab('inspect')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inspect' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                  >
                    Adatbázis
                  </button>
                  <button 
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'view' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                  >
                    Képernyő
                  </button>
                </div>
              </div>

              {/* User Content */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-black/40">
                {activeTab === 'users' ? (
                  <div className="space-y-8 max-w-4xl">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Telepített appok', value: selectedUser.installedAppIds?.length || 0, icon: Smartphone, color: 'text-blue-500' },
                        { label: 'Jelszavak', value: inspectData?.passwords.length || 0, icon: Lock, color: 'text-emerald-500' },
                        { label: 'Jegyzetek', value: inspectData?.notes.length || 0, icon: FileText, color: 'text-amber-500' },
                        { label: 'Beszerzés', value: inspectData?.shopping.length || 0, icon: ShoppingCart, color: 'text-indigo-500' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[28px]">
                          <stat.icon className={`${stat.color} mb-4`} size={24} />
                          <div className="text-2xl font-black">{stat.value}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Installed Apps */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 px-2">Telepített alkalmazások</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedUser.installedAppIds?.map(appId => (
                          <div key={appId} className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
                              {appId === 'flame' ? <Flame size={20} className="text-rose-500 fill-rose-500/20" /> : 
                               appId === 'recipes' ? <ChefHat size={20} className="text-amber-500" /> :
                               appId === 'shopping' ? <ShoppingCart size={20} className="text-indigo-500" /> :
                               appId === 'passwords' ? <Lock size={20} className="text-emerald-500" /> :
                               appId === 'notes' ? <FileText size={20} className="text-amber-500" /> :
                               appId === 'calendar' ? <Smartphone size={20} className="text-blue-500" /> :
                               <Smartphone size={20} />}
                            </div>
                            <span className="text-xs font-bold capitalize">{appId}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Settings Details */}
                    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <SettingsIcon size={18} className="text-zinc-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Alapértelmezett beállítások</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500 font-bold">Háttérkép</span>
                          <span className="text-xs font-mono text-zinc-400 truncate max-w-[200px]">{selectedUser.settings?.wallpaper}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500 font-bold">Téma</span>
                          <span className="text-xs font-bold px-3 py-1 bg-zinc-800 rounded-lg capitalize">{selectedUser.settings?.theme}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500 font-bold">E-mail</span>
                          <span className="text-xs font-bold text-blue-400 underline">{selectedUser.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'inspect' ? (
                  <div className="space-y-12 pb-20">
                    {/* Password Inspection */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 px-2">
                        <Lock size={20} className="text-emerald-500" />
                        <h3 className="text-lg font-black tracking-tight">Mentett Jelszavak</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inspectData?.passwords.map(pw => (
                          <div key={pw.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-amber-500">{pw.appName}</h4>
                              <Lock size={14} className="text-zinc-600" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Email / User</div>
                              <div className="bg-black/50 p-3 rounded-xl text-sm font-bold border border-white/5">{pw.email}</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Jelszó</div>
                              <div className="bg-black/50 p-3 rounded-xl text-sm font-mono font-bold border border-white/5 text-emerald-400">{pw.password}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Notes Inspection */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 px-2">
                        <FileText size={20} className="text-amber-500" />
                        <h3 className="text-lg font-black tracking-tight">Privát Jegyzetek</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {inspectData?.notes.map(note => (
                          <div key={note.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[32px]">
                            <h4 className="font-bold text-lg mb-2">{note.title}</h4>
                            <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-zinc-600 font-bold flex items-center gap-2">
                              {note.createdAt && new Date(note.createdAt.seconds * 1000).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Shopping List */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 px-2">
                        <ShoppingCart size={20} className="text-indigo-500" />
                        <h3 className="text-lg font-black tracking-tight">Tételek</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {inspectData?.shopping.map(item => (
                          <div key={item.id} className={`px-5 py-3 rounded-2xl border text-sm font-bold flex items-center gap-3 ${item.completed ? 'bg-zinc-900 border-white/5 text-zinc-600 line-through' : 'bg-white/5 border-white/10 text-white'}`}>
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="flex justify-center items-start pt-10 pb-20">
                    <div className="relative w-[340px] h-[680px] bg-zinc-900 rounded-[50px] border-[8px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
                      {/* Wallpaper Backdrop */}
                      {!activeMiniAppId && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${selectedUser.settings?.wallpaper || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000'})` }}
                        >
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      )}

                      {/* Content Area */}
                      <div className="relative flex-1 flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                          {!activeMiniAppId ? (
                            <motion.div 
                              key="home"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col p-6 pt-12"
                            >
                              {/* Status Bar */}
                              <div className="flex justify-between items-center text-white/90 px-2 font-bold text-sm mb-12">
                                <span>{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-2 bg-white/30 rounded-sm" />
                                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                                </div>
                              </div>

                              {/* App Grid */}
                              <div className="grid grid-cols-4 gap-4">
                                <div className="flex flex-col items-center gap-1.5 opacity-60">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <ShoppingCart className="text-blue-500" size={20} />
                                  </div>
                                  <span className="text-[10px] text-white font-medium">Áruház</span>
                                </div>

                                {selectedUser.installedAppIds?.map(appId => {
                                  const appInfo = AVAILABLE_APPS.find(a => a.id === appId);
                                  return (
                                    <button 
                                      key={appId} 
                                      onClick={() => setActiveMiniAppId(appId)}
                                      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform group"
                                    >
                                      <div className={`w-12 h-12 ${appInfo?.color || 'bg-zinc-800/80'} backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/10 group-hover:bg-white/20 transition-colors`}>
                                        {appId === 'flame' ? <Flame size={20} className="text-rose-500 fill-rose-500/20" /> : 
                                         appId === 'recipes' ? <ChefHat size={20} className="text-amber-500" /> :
                                         appId === 'shopping' ? <ShoppingCart size={20} className="text-indigo-500" /> :
                                         appId === 'notes' ? <FileText size={20} className="text-amber-500" /> :
                                         appId === 'passwords' ? <Lock size={20} className="text-emerald-500" /> :
                                         appId === 'settings' ? <SettingsIcon size={20} className="text-zinc-400" /> :
                                         appId === 'spotify' ? <Smartphone size={20} className="text-green-500" /> :
                                         <Smartphone size={20} className="text-zinc-400" />}
                                      </div>
                                      <span className="text-[9px] text-white font-bold truncate w-full text-center capitalize drop-shadow-md">{appId}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Dock */}
                              <div className="mt-auto bg-white/10 backdrop-blur-xl rounded-[24px] p-2 flex justify-around border border-white/10 mb-2">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Smartphone size={18} className="text-white" />
                                </div>
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Mail size={18} className="text-white" />
                                </div>
                                <button 
                                  onClick={() => setActiveMiniAppId('settings')}
                                  className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                                >
                                  <SettingsIcon size={18} className="text-white" />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="app-simulation"
                              initial={{ opacity: 0, scale: 0.95, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 20 }}
                              className="absolute inset-0 z-10 bg-black flex flex-col"
                            >
                              <div className="flex-1 overflow-hidden relative">
                                {renderMiniApp()}
                              </div>
                              
                              {/* Virtual Navigation Bar */}
                              <div className="h-10 bg-zinc-900 border-t border-white/5 flex items-center justify-around px-10">
                                <button onClick={() => setActiveMiniAppId(null)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                                  <Home size={18} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Hardware Controls */}
                      <div className="absolute right-[-10px] top-32 w-[6px] h-16 bg-zinc-800 rounded-r-lg" />
                      <div className="absolute right-[-10px] top-52 w-[6px] h-12 bg-zinc-800 rounded-r-lg" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-20">
              <Database size={80} strokeWidth={1} className="text-amber-500" />
              <div>
                <h3 className="text-xl font-bold tracking-tight">Válassz ki egy felhasználót</h3>
                <p className="text-sm font-medium mt-2">Az adatok megtekintéséhez nézd át a bal oldali listát</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
