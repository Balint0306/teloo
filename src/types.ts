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
    description: 'Zenehallgatás'
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
    id: 'netflix2',
    name: 'Netflix 2',
    icon: 'Play',
    color: 'bg-black text-red-500',
    category: 'Entertainment',
    description: 'Custom Player Test',
    customIconUrl: 'https://loodibee.com/wp-content/uploads/Netflix-N-Symbol-logo.png'
  }
];
