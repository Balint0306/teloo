export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  description: string;
  customIconUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  installedAppIds: string[];
  settings: {
    wallpaper: string;
    theme: 'light' | 'dark';
    photoURL?: string;
    displayName?: string;
  };
}

export const SYSTEM_APPS: AppInfo[] = [
  {
    id: 'playstore',
    name: 'Play Áruház',
    icon: 'ShoppingBag',
    color: 'bg-white text-blue-500',
    category: 'System',
    description: 'Apps letöltése'
  },
  {
    id: 'settings',
    name: 'Beállítások',
    icon: 'Settings',
    color: 'bg-gray-200 text-gray-700',
    category: 'System',
    description: 'Telefon testreszabása'
  }
];

export const AVAILABLE_APPS: AppInfo[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    icon: 'Play',
    color: 'bg-black text-red-600',
    category: 'Entertainment',
    description: 'Filmek és sorozatok',
    customIconUrl: 'https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'Music',
    color: 'bg-[#1DB954] text-white',
    category: 'Music',
    description: '1:1 Spotify Clone (Még fejlesztés alatt)',
    customIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png'
  },
  {
    id: 'weather',
    name: 'Időjárás',
    icon: 'Cloud',
    color: 'bg-blue-400 text-white',
    category: 'Tool',
    description: 'Valós idejű időjárás adatok'
  },
  {
    id: 'notes',
    name: 'Jegyzetek',
    icon: 'FileText',
    color: 'bg-amber-400 text-white',
    category: 'Tool',
    description: 'Jegyezd fel gondolataid'
  },
  {
    id: 'calendar',
    name: 'Naptár',
    icon: 'Calendar',
    color: 'bg-red-500 text-white',
    category: 'Tool',
    description: 'Események és időpontok'
  },
  {
    id: 'passwords',
    name: 'Jelszavak',
    icon: 'ShieldCheck',
    color: 'bg-emerald-600 text-white',
    category: 'Tool',
    description: 'Biztonságos jelszókezelő'
  },
  {
    id: 'shopping',
    name: 'Lista',
    icon: 'ShoppingCart',
    color: 'bg-indigo-500 text-white',
    category: 'Tool',
    description: 'Bevásárló lista'
  },
  {
    id: 'recipes',
    name: 'Receptek',
    icon: 'ChefHat',
    color: 'bg-orange-500 text-white',
    category: 'Lifestyle',
    description: 'Saját receptkönyv'
  },
  {
    id: 'flame',
    name: 'Flame',
    icon: 'Flame',
    color: 'bg-gradient-to-br from-rose-600 to-orange-600 text-white',
    category: 'Games',
    description: 'Páros játékok és izgalmak (18+)',
    customIconUrl: 'https://cdn-icons-png.flaticon.com/512/785/785116.png'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    color: 'bg-[#1877F2] text-white',
    category: 'Social',
    description: 'Közösség'
  },
  {
    id: 'chrome',
    name: 'Chrome',
    icon: 'Globe',
    color: 'bg-white text-blue-600',
    category: 'Tool',
    description: 'Böngészés'
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: 'Shield',
    color: 'bg-zinc-900 text-amber-500',
    category: 'System',
    description: 'Rendszer felügyelet (Jelszó szükséges)',
  }
];
