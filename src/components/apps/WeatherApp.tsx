import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, Sun, CloudRain, CloudLightning, 
  Wind, Droplets, Thermometer, Search,
  ChevronLeft, MapPin, RefreshCw, Menu,
  Clock, CloudSnow, CloudFog, AlertTriangle,
  Plus, Trash2, Check, Navigation, Moon,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
  hourly: { time: string; temp: number; condition: string; icon: string; precip: number }[];
  forecast: { day: string; date: string; tempMax: number; tempMin: number; condition: string; icon: string; description: string }[];
  alerts?: { headline: string; description: string; onset: string; ends: string }[];
}

interface WeatherSettings {
  savedLocations: string[];
  useCurrentLocation: boolean;
  lastSelectedCity: string;
}

const WeatherApp = ({ onClose }: { onClose: () => void }) => {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const [settings, setSettings] = useState<WeatherSettings>({
    savedLocations: ['Ádánd', 'Siófok', 'Székesfehérvár'],
    useCurrentLocation: false,
    lastSelectedCity: 'Ádánd'
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // Load settings from Firestore
  useEffect(() => {
    if (!user) return;

    const settingsRef = doc(db, 'users', user.uid, 'appData', 'weather');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as WeatherSettings;
        setSettings(data);
      } else {
        const initialSettings: WeatherSettings = {
          savedLocations: ['Ádánd', 'Siófok', 'Székesfehérvár'],
          useCurrentLocation: false,
          lastSelectedCity: 'Ádánd'
        };
        setDoc(settingsRef, initialSettings);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Initial load and refresh on open
  useEffect(() => {
    const refreshAll = async () => {
      setLoading(true);
      const locations = [...settings.savedLocations];
      
      if (settings.useCurrentLocation) {
        fetchByGeolocation();
      } else {
        await Promise.all(locations.map(city => fetchWeather(city)));
      }
      setLoading(false);
    };

    if (user?.uid) {
      refreshAll();
    }
  }, [user?.uid, settings.savedLocations.length]);

  const fetchWeather = async (query: string) => {
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Város nem található');
      }
      
      const current = data.currentConditions;
      const days = data.days;
      
      if (!days || days.length === 0) {
        throw new Error('Nincs elérhető időjárási adat ehhez a helyszínhez');
      }

      let resolvedCity = data.resolvedAddress.split(',')[0];
      // If it's a coordinate string, try to get a better name from the first day or address
      if (/^\d+\.?\d*$/.test(resolvedCity.replace('-', '').replace('.', ''))) {
        const parts = data.resolvedAddress.split(',');
        resolvedCity = parts.length > 1 ? parts[1].trim() : parts[0];
      }

      const allHours = [...days[0].hours, ...days[1].hours];
      const currentHour = parseInt(current.datetime.split(':')[0]);
      const currentHourStr = currentHour.toString().padStart(2, '0') + ':00';
      
      const startIndex = allHours.findIndex((h: any) => h.datetime >= currentHourStr);
      let relevantHours = allHours.slice(startIndex, startIndex + 24);

      // We still want the first hour entry to represent the CURRENT observation precisely
      if (relevantHours.length > 0) {
        relevantHours[0] = {
          ...relevantHours[0],
          temp: current.temp,
          conditions: current.conditions,
          icon: current.icon,
          precipprob: current.precipprob || 0,
          isNow: true
        };
      }

      const mappedWeather: WeatherData = {
        city: resolvedCity,
        temp: Math.round(current.temp),
        condition: current.conditions,
        icon: current.icon,
        description: current.conditions,
        humidity: Math.round(current.humidity),
        windSpeed: Math.round(current.windspeed),
        feelsLike: Math.round(current.feelslike),
        uvIndex: current.uvindex?.toString() || '0',
        tempMax: Math.round(days[0].tempmax),
        tempMin: Math.round(days[0].tempmin),
        precipProb: Math.round(current.precipprob || 0),
        sunrise: current.sunrise,
        sunset: current.sunset,
        hourly: relevantHours.map((h: any) => ({
          time: h.datetime.substring(0, 5),
          temp: Math.round(h.temp),
          condition: h.conditions,
          icon: h.icon,
          precip: Math.round(h.precipprob || 0)
        })),
        forecast: days.map((w: any) => ({
          day: new Date(w.datetime).toLocaleDateString('hu-HU', { weekday: 'short' }),
          date: w.datetime,
          tempMax: Math.round(w.tempmax),
          tempMin: Math.round(w.tempmin),
          condition: w.conditions,
          icon: w.icon,
          description: w.description
        })),
        alerts: data.alerts || []
      };
      
      setWeatherData(prev => ({ ...prev, [query]: mappedWeather }));
      setError('');
      return mappedWeather;
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      // Only set error if we have no data at all for this city
      if (!weatherData[query]) {
        setError(err.message || 'Hálózat hiba');
      }
      return null;
    }
  };

  const saveSettings = async (newSettings: WeatherSettings) => {
    setSettings(newSettings); // Optimistically update
    if (!user) return;
    try {
      const settingsRef = doc(db, 'users', user.uid, 'appData', 'weather');
      await setDoc(settingsRef, newSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const fetchByGeolocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const query = `${latitude},${longitude}`;
        const data = await fetchWeather(query);
        if (data) {
          saveSettings({ ...settings, lastSelectedCity: query, useCurrentLocation: true });
        }
      },
      (err) => {
        console.error(err);
      }
    );
  };

  const activeLocations = settings.savedLocations;
  const currentIndex = activeLocations.indexOf(settings.lastSelectedCity);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (activeLocations.length <= 1) return;
    let nextIndex = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = activeLocations.length - 1;
    if (nextIndex >= activeLocations.length) nextIndex = 0;
    
    saveSettings({ ...settings, lastSelectedCity: activeLocations[nextIndex] });
  };
  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearchingSuggestions(true);
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=hu`);
      const data = await response.json();
      const items = data.features.map((f: any) => ({
        name: f.properties.name,
        city: f.properties.city || f.properties.name,
        country: f.properties.country,
        state: f.properties.state
      }));
      const unique = items.filter((v: any, i: number, a: any[]) => 
        a.findIndex(t => t.name === v.name && t.state === v.state) === i
      );
      setSuggestions(unique);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchSuggestions(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const addLocation = (cityName: string) => {
    if (!settings.savedLocations.includes(cityName)) {
      saveSettings({
        ...settings,
        savedLocations: [...settings.savedLocations, cityName],
        lastSelectedCity: cityName,
        useCurrentLocation: false
      });
    }
    setShowLocations(false);
  };

  const removeLocation = (cityName: string) => {
    const updated = settings.savedLocations.filter(c => c !== cityName);
    saveSettings({ ...settings, savedLocations: updated });
  };

  const getWeatherIcon = (icon: string, size = 48) => {
    const i = icon.toLowerCase();
    const isNight = i.includes('night');

    if (i.includes('thunder') || i.includes('storm')) 
      return <CloudLightning size={size} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    
    if (i.includes('rain') || i.includes('shower') || i.includes('drizzle')) 
      return <CloudRain size={size} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />;
    
    if (i.includes('snow') || i.includes('sleet')) 
      return <CloudSnow size={size} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />;
    
    if (i.includes('fog') || i.includes('mist')) 
      return <CloudFog size={size} className="text-gray-300 opacity-80" />;

    if (i.includes('cloud') || i.includes('overcast')) {
      if (i.includes('partly')) {
        return (
          <div className="relative">
            {isNight ? <Moon size={size} className="text-blue-200" /> : <Sun size={size} className="text-yellow-400" />}
            <Cloud size={size * 0.7} className="absolute -bottom-1 -right-2 text-zinc-400" />
          </div>
        );
      }
      return <Cloud size={size} className="text-zinc-300" />;
    }
    
    if (isNight) return <Moon size={size} className="text-blue-200 drop-shadow-[0_0_10px_rgba(191,219,254,0.4)]" />;
    return <Sun size={size} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />;
  };

  const getBackgroundImage = (icon: string) => {
    const i = icon.toLowerCase();
    if (i.includes('night')) {
      if (i.includes('cloud')) return 'https://images.unsplash.com/photo-1532983330958-2f32bbe9bb0e?q=80&w=1200';
      if (i.includes('rain')) return 'https://images.unsplash.com/photo-1534274988757-a28bf1f53d17?q=80&w=1200';
      return 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1200';
    }
    if (i.includes('storm')) return 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1200';
    if (i.includes('rain')) return 'https://images.unsplash.com/photo-1534274988757-a28bf1f53d17?q=80&w=1200';
    if (i.includes('snow')) return 'https://images.unsplash.com/photo-1542601039-46733979854d?q=80&w=1200';
    if (i.includes('fog')) return 'https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1200';
    if (i.includes('cloud')) return 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200';
    return 'https://images.unsplash.com/photo-1561677843-39dee7a3199c?q=80&w=1200';
  };

  const getSummary = () => {
    if (!weather) return '';
    return `Túlnyomóan ${weather.description.toLowerCase()}. A legalacsonyabb hőmérséklet ${weather.tempMin}°C.`;
  };

  const weather = weatherData[settings.lastSelectedCity];

  return (
    <div className="flex-1 flex flex-col font-sans text-white overflow-hidden relative bg-black">
      <AnimatePresence mode="wait">
        <motion.div 
          key={weather?.icon}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={weather ? getBackgroundImage(weather.icon) : 'https://images.unsplash.com/photo-1561677843-39dee7a3199c?q=80&w=1000'} 
            className="w-full h-full object-cover" 
            alt="background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </motion.div>
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-6 pb-32">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-56"
            >
              <div className="relative">
                <RefreshCw className="animate-spin text-white/20" size={60} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cloud className="text-white/40" size={24} />
                </div>
              </div>
              <p className="mt-8 text-white/30 font-black tracking-[0.3em] uppercase text-[9px]">Időjárás adatok betöltése</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center pt-48 text-center px-8"
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <AlertTriangle className="text-red-500/60" size={40} />
              </div>
              <h2 className="text-white font-black text-3xl mb-4 tracking-tighter">Hiba történt</h2>
              <p className="text-white/40 mb-12 text-sm leading-relaxed max-w-[280px]">
                {error}. Kérjük ellenőrizd a kapcsolatot vagy próbáld később.
              </p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setError('');
                  const locations = [...settings.savedLocations];
                  Promise.all(locations.map(city => fetchWeather(city))).finally(() => setLoading(false));
                }}
                className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                Újrapróbálás
              </button>
            </motion.div>
          ) : weather ? (
            <motion.div 
              key={weather.city}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -80) handleSwipe('left');
                else if (swipe > 80) handleSwipe('right');
              }}
              className="pt-10 cursor-grab active:cursor-grabbing pb-12"
            >
              {/* Ultra Modern Hero Section */}
              <div className="text-center mb-16 select-none pt-4">
                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center justify-center gap-3 mb-10"
                >
                   <MapPin size={18} className="text-white/40" />
                   <motion.h1 
                     layoutId="city-name"
                     className="text-3xl font-black tracking-tight drop-shadow-2xl"
                   >
                     {weather.city}
                   </motion.h1>
                   {settings.useCurrentLocation && <Navigation size={14} className="text-blue-400 opacity-60" />}
                </motion.div>
                
                <div className="flex flex-col items-center relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse" />
                    <span className="text-[140px] font-[100] leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-10">{weather.temp}</span>
                    <span className="text-6xl font-light opacity-30 mt-[-100px] z-10">°</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 flex flex-col items-center gap-1.5"
                  >
                    <div className="text-xl font-bold tracking-wider uppercase bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-white/80 border border-white/5">{weather.description}</div>
                    <div className="flex items-center gap-6 text-sm font-black mt-4 opacity-50 tracking-widest">
                       <span className="flex items-center gap-2">MAGAS {weather.tempMax}°</span>
                       <span className="w-1 h-1 bg-white/20 rounded-full" />
                       <span className="flex items-center gap-2">ALACSONY {weather.tempMin}°</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Dynamic Information Grid */}
              <div className="space-y-6">
                {/* Visual Summary Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/20 backdrop-blur-3xl rounded-[32px] p-7 border border-white/5 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {getWeatherIcon(weather.icon, 80)}
                  </div>
                  <p className="text-[17px] font-medium leading-relaxed tracking-tight text-white/80 relative z-10 pr-12">
                    {getSummary()}
                  </p>
                </motion.div>

                {/* Hourly Progress - Re-imagined */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/20 backdrop-blur-3xl rounded-[40px] pt-8 pb-10 px-4 border border-white/5 shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-8 px-6 opacity-30">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">24 Órás előrejelzés</h3>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full opacity-50" />)}
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar scroll-smooth snap-x" ref={scrollRef}>
                    <div className="flex gap-2 min-w-max px-4 relative">
                      {weather.hourly.map((h, i) => (
                        <div key={i} className={`flex flex-col items-center py-6 px-4 snap-center w-[75px] rounded-[28px] transition-all group ${i === 0 ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'}`}>
                          <span className={`text-[10px] font-bold tracking-tight mb-4 ${i === 0 ? 'text-white' : 'text-white/30'}`}>{i === 0 ? 'MOST' : h.time}</span>
                          <div className="h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                            {getWeatherIcon(h.icon, 28)}
                          </div>
                          <span className="text-xl font-black tracking-tighter mt-4">{h.temp}°</span>
                          
                          <div className="mt-6 flex flex-col items-center">
                             {h.precip > 0 ? (
                               <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{h.precip}%</span>
                             ) : (
                               <div className="w-1 h-1 bg-white/10 rounded-full" />
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Extended Forecast Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-black/20 backdrop-blur-3xl rounded-[40px] p-10 border border-white/5 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-12 opacity-30">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em]">Heti áttekintés</h3>
                    <Clock size={16} />
                  </div>
                  <div className="space-y-10">
                     {weather.forecast.slice(0, 8).map((f, i) => (
                       <div key={i} className="flex items-center group cursor-default">
                          <div className="w-16 font-bold text-sm tracking-tight capitalize">{i === 0 ? 'Ma' : f.day}</div>
                          <div className="flex-1 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                             {getWeatherIcon(f.icon, 20)}
                          </div>
                          <div className="w-32 flex justify-end items-center gap-6">
                             <div className="flex flex-col items-end">
                               <span className="font-black text-lg tracking-tighter">{f.tempMax}°</span>
                               <span className="text-[10px] font-bold text-white/20">{f.tempMin}°</span>
                             </div>
                             <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden shrink-0 relative">
                                <div className="absolute left-[30%] right-[20%] h-full bg-gradient-to-r from-blue-400/30 to-red-400/30 rounded-full" />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                </motion.div>

                {/* Environmental Bento Grid */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-5"
                >
                   <div className="bg-black/20 backdrop-blur-3xl rounded-[32px] p-7 border border-white/5 shadow-xl flex flex-col justify-between h-44 group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                         <Droplets size={16} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Páratartalom</span>
                      </div>
                      <div>
                        <div className="text-4xl font-black mb-1">{weather.humidity}%</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">Telítettség</div>
                      </div>
                   </div>
                   <div className="bg-black/20 backdrop-blur-3xl rounded-[32px] p-7 border border-white/5 shadow-xl flex flex-col justify-between h-44 group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                         <Wind size={16} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Szélsebesség</span>
                      </div>
                      <div>
                        <div className="text-4xl font-black mb-1">{weather.windSpeed}</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">km/óra • ÉNY</div>
                      </div>
                   </div>
                   <div className="bg-black/20 backdrop-blur-3xl rounded-[32px] p-7 border border-white/5 shadow-xl flex flex-col justify-between h-44 group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                         <Sun size={16} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">UV Index</span>
                      </div>
                      <div>
                        <div className="text-4xl font-black mb-1">{weather.uvIndex}</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">{parseInt(weather.uvIndex) > 5 ? 'MAGAS' : 'ALACSONY'}</div>
                      </div>
                   </div>
                   <div className="bg-black/20 backdrop-blur-3xl rounded-[32px] p-7 border border-white/5 shadow-xl flex flex-col justify-between h-44 group hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
                         <Thermometer size={16} />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Hőérzet</span>
                      </div>
                      <div>
                        <div className="text-4xl font-black mb-1">{weather.feelsLike}°</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">Valós érzet</div>
                      </div>
                   </div>
                </motion.div>

                {/* Sun & Moon Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-black/20 backdrop-blur-3xl rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent pointer-events-none" />
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-3 opacity-30">
                            <Sun size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Kelt-Nyugati</span>
                         </div>
                         <div className="flex items-end gap-2">
                           <span className="text-3xl font-black tracking-tighter">{weather.sunrise.substring(0, 5)}</span>
                           <span className="text-xs font-bold opacity-20 mb-1">Napkelte</span>
                         </div>
                      </div>
                      <div className="w-px h-16 bg-white/5" />
                      <div className="flex flex-col items-end gap-3 text-right">
                         <div className="flex items-center gap-3 opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Helyi idő</span>
                            <Clock size={16} />
                         </div>
                         <div className="flex items-end gap-2 flex-row-reverse">
                           <span className="text-3xl font-black tracking-tighter">{weather.sunset.substring(0, 5)}</span>
                           <span className="text-xs font-bold opacity-20 mb-1">Napnyugta</span>
                         </div>
                      </div>
                   </div>
                </motion.div>

                {/* Active Alerts */}
                {weather.alerts && weather.alerts.length > 0 && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-500/10 backdrop-blur-3xl rounded-[32px] p-7 border border-red-500/20 flex gap-5 items-start mt-4"
                  >
                    <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                    <div className="flex-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-red-500/80">Veszélyjelzés</h3>
                      <p className="text-sm font-bold leading-relaxed text-white/90">{weather.alerts[0].headline}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 inset-x-6 h-16 flex items-center justify-between z-[100]">
        <button onClick={() => setShowLocations(true)} className="w-14 h-14 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl active:scale-95 transition-all">
           <Menu size={20} />
        </button>
        <div className="flex gap-2.5 bg-black/40 backdrop-blur-xl px-4 py-3 rounded-full border border-white/5">
           {activeLocations.map((_, i) => (
             <div 
               key={i} 
               className={`w-1.5 h-1.5 transition-all rounded-full ${i === currentIndex ? 'bg-white w-3' : 'bg-white/20'}`} 
             />
           ))}
        </div>
        <button onClick={() => setShowLocations(true)} className="w-14 h-14 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl active:scale-95 transition-all">
           <Search size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showLocations && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[200] bg-black shadow-2xl flex flex-col p-8 pt-16"
          >
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-3xl font-bold tracking-tight">Helyszínek</h2>
               <button onClick={() => setShowLocations(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <Plus size={24} />
               </button>
            </div>

            <div className="relative mb-6">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keress várost..."
                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-4 pl-14 pr-6 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg font-medium"
              />
            </div>

            <div className="relative z-[210]">
               <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="absolute inset-x-0 top-0 overflow-hidden bg-zinc-900/95 backdrop-blur-xl rounded-[28px] border border-white/20 shadow-3xl"
                  >
                    {suggestions.map((s, i) => (
                      <div 
                        key={i}
                        onClick={() => {
                          addLocation(s.name);
                          setSearchQuery('');
                          setSuggestions([]);
                        }}
                        className="p-6 hover:bg-white/10 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">{s.name}</span>
                          <span className="text-xs opacity-40 uppercase tracking-widest">{s.state || s.country}</span>
                        </div>
                        <Plus size={18} className="opacity-40" />
                      </div>
                    ))}
                  </motion.div>
                )}
               </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mt-4">
               <div 
                 onClick={() => {
                   saveSettings({ ...settings, useCurrentLocation: !settings.useCurrentLocation });
                   setShowLocations(false);
                 }}
                 className={`p-6 rounded-[32px] flex items-center justify-between cursor-pointer transition-all ${settings.useCurrentLocation ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
               >
                  <div className="flex items-center gap-6">
                     <div className={`p-4 rounded-2xl ${settings.useCurrentLocation ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Navigation size={22} className={settings.useCurrentLocation ? 'animate-pulse' : ''} />
                     </div>
                     <div>
                        <div className="font-bold text-xl">Jelenlegi helyzet</div>
                        <div className="text-sm opacity-60">GPS alapú pontos adatok</div>
                     </div>
                  </div>
                  {settings.useCurrentLocation && <Check size={24} />}
               </div>

               {settings.savedLocations.map(cityName => (
                 <div key={cityName} className="relative group">
                   <div 
                      onClick={() => {
                        saveSettings({ ...settings, lastSelectedCity: cityName, useCurrentLocation: false });
                        setShowLocations(false);
                        fetchWeather(cityName);
                      }}
                      className={`p-6 rounded-[32px] flex items-center justify-between cursor-pointer transition-all border ${settings.lastSelectedCity === cityName && !settings.useCurrentLocation ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                   >
                     <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-zinc-800">
                          <MapPin size={22} className="opacity-40" />
                        </div>
                        <span className="font-bold text-xl">{cityName}</span>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); removeLocation(cityName); }}
                       className="p-4 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all"
                     >
                       <Trash2 size={20} />
                     </button>
                   </div>
                 </div>
               ))}
            </div>

            <button onClick={() => setShowLocations(false)} className="mt-8 w-full py-5 bg-white/5 hover:bg-white/10 rounded-[28px] font-black transition-all text-sm uppercase tracking-[0.2em] border border-white/5">
               Vissza
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherApp;
