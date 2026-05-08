import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Image as ImageIcon, Wallpaper, Bell, Shield, Info, LogOut, ChevronRight, Camera, Check } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1541450805268-4822a3a774ce?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000',
];

const SettingsApp: React.FC<{ user: any; profile: any; onClose: () => void }> = ({ user, profile, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile?.settings?.photoURL || user?.photoURL || '');
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.settings?.displayName || user?.displayName || user?.email?.split('@')[0] || '');

  // Keep local editing states in sync with actual profile data
  React.useEffect(() => {
    if (profile?.settings?.photoURL) setPhotoUrl(profile.settings.photoURL);
    if (profile?.settings?.displayName) setDisplayName(profile.settings.displayName);
  }, [profile]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: displayName,
          photoURL: photoUrl 
        });
      }
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        'settings.photoURL': photoUrl,
        'settings.displayName': displayName 
      });
      
      setShowAccountDetails(false);
    } catch (error) {
      console.error(error);
      alert('Hiba történt a mentés során.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfilePicture = async () => {
    const newUrl = prompt('Adja meg az új profilkép URL-jét:', profile?.settings?.photoURL || photoUrl);
    if (newUrl && newUrl !== photoUrl) {
      setIsUpdating(true);
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: newUrl });
        }
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 'settings.photoURL': newUrl });
        setPhotoUrl(newUrl);
      } catch (error) {
        console.error("Hiba a kép mentésekor:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleUpdateDisplayName = async () => {
    const newName = prompt('Add meg az új neved:', profile?.settings?.displayName || displayName);
    if (newName && newName !== displayName) {
      setIsUpdating(true);
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: newName });
        }
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 'settings.displayName': newName });
        setDisplayName(newName);
      } catch (error) {
        console.error("Hiba a név mentésekor:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleWallpaperChange = async (url: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 'settings.wallpaper': url });
      setShowWallpaperPicker(false);
    } catch (error) {
      console.error(error);
      alert('Hiba történt a háttérkép mentésekor.');
    }
  };

  const handleCustomWallpaper = () => {
    const url = prompt('Add meg a saját háttérkép URL-jét:', profile?.settings?.wallpaper);
    if (url) {
      handleWallpaperChange(url);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F2F2F7] text-zinc-900 overflow-hidden font-sans relative">
      <div className="p-8 pt-16 bg-white border-b border-zinc-200/50 shadow-sm transition-all">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Beállítások</h1>
        
        <div className="flex items-center gap-6 bg-[#F2F2F7]/50 backdrop-blur-xl p-5 rounded-[32px] border border-white shadow-inner mb-2">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-1 ring-black/5">
              <img src={profile?.settings?.photoURL || photoUrl || user?.photoURL || 'https://i.pravatar.cc/100'} alt="p" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={handleUpdateProfilePicture}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-500 transition-all active:scale-90"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1" onClick={handleUpdateDisplayName}>
            <h2 className="text-xl font-bold text-zinc-900 leading-tight">
              {profile?.settings?.displayName || user?.displayName || (user?.email?.split('@')[0])}
              <span className="ml-2 text-[10px] text-blue-500 font-normal uppercase tracking-widest">(Szerkesztés)</span>
            </h2>
            <p className="text-zinc-500 text-[13px] font-medium opacity-70">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-20">
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Profil</h3>
          <div className="bg-white rounded-[32px] overflow-hidden border border-zinc-200/50 shadow-sm">
            <button 
              onClick={() => setShowAccountDetails(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm"><User size={20} /></div>
                <span className="font-semibold text-[15px]">Fiók adatai</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
            <button 
              onClick={handleUpdateProfilePicture}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm"><ImageIcon size={20} /></div>
                <span className="font-semibold text-[15px]">Profilkép módosítása</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Megjelenítés</h3>
          <div className="bg-white rounded-[32px] overflow-hidden border border-zinc-200/50 shadow-sm">
            <button 
              onClick={() => setShowWallpaperPicker(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl shadow-sm"><Wallpaper size={20} /></div>
                <span className="font-semibold text-[15px]">Háttérkép módosítása</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md overflow-hidden border border-zinc-200">
                  <img src={profile?.settings?.wallpaper} className="w-full h-full object-cover" alt="w" />
                </div>
                <ChevronRight size={18} className="text-zinc-300" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-2xl shadow-sm"><Bell size={20} /></div>
                <span className="font-semibold text-[15px]">Értesítések</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Biztonság & Rendszer</h3>
          <div className="bg-white rounded-[32px] overflow-hidden border border-zinc-200/50 shadow-sm">
            <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-zinc-100 text-zinc-600 rounded-2xl shadow-sm"><Shield size={20} /></div>
                <span className="font-semibold text-[15px]">Adatvédelem</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-zinc-100 text-zinc-600 rounded-2xl shadow-sm"><Info size={20} /></div>
                <span className="font-semibold text-[15px]">Névjegy</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
          </div>
        </section>

        <button 
          onClick={() => auth.signOut()}
          className="w-full bg-white text-rose-600 p-6 rounded-[32px] font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all mb-10 shadow-sm border border-rose-50"
        >
          <LogOut size={20} />
          Kijelentkezés
        </button>
      </div>

      <AnimatePresence>
        {showAccountDetails && (
          <motion.div 
            key="account-details"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[120] bg-white flex flex-col pt-12"
          >
            <div className="p-6 flex items-center justify-between border-b border-zinc-100">
              <button onClick={() => setShowAccountDetails(false)} className="text-blue-600 font-bold">Vissza</button>
              <h2 className="text-xl font-bold">Fiók adatai</h2>
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="text-blue-600 font-bold disabled:opacity-50"
              >
                {isUpdating ? 'Mentés...' : 'Kész'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-100 shadow-md">
                   <img src={photoUrl || 'https://i.pravatar.cc/100'} alt="p" className="w-full h-full object-cover" />
                </div>
                <button onClick={handleUpdateProfilePicture} className="text-blue-600 text-sm font-bold">Kép módosítása</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Megjelenített név</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email cím</label>
                  <input 
                    type="email" 
                    value={user?.email}
                    disabled
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-bold opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showWallpaperPicker && (
          <motion.div 
            key="wallpaper-picker"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[120] bg-white flex flex-col pt-12"
          >
            <div className="flex-none p-6 pt-12 flex items-center justify-between border-b border-zinc-100 bg-white shadow-sm z-10 relative">
              <h2 className="text-2xl font-bold">Háttérképek</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCustomWallpaper}
                  className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200"
                >
                  Saját URL
                </button>
                <button 
                  onClick={() => setShowWallpaperPicker(false)}
                  className="text-blue-600 font-bold"
                >
                  Mégse
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-6 grid grid-cols-2 gap-4 no-scrollbar pb-40">
              {WALLPAPERS.map((url, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWallpaperChange(url)}
                  className="h-72 rounded-3xl overflow-hidden relative shadow-md group border-2 border-transparent hover:border-blue-500 transition-all bg-zinc-50"
                >
                  <img 
                    src={url} 
                    className="w-full h-full object-cover" 
                    alt={`w-${i}`}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000';
                    }}
                  />
                  {profile?.settings?.wallpaper === url && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                        <Check size={24} />
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsApp;

