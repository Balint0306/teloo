export interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  videoUrl: string;
  color: string;
}

export const SPOTIFY_TRACKS: Track[] = [
  { 
    id: 1, 
    title: 'After Hours', 
    artist: 'The Weeknd', 
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/328941011/music-22920.mp4?width=1280&hash=d3e0e7a2e0e7a2a2e0e7a2a2e0e7a2a2e0e7a2a2',
    color: '#f97316' 
  },
  { 
    id: 2, 
    title: 'Future Nostalgia', 
    artist: 'Dua Lipa', 
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/328941011/music-22920.mp4?width=640&hash=d3e0e7a2e7a2a2e0e7a2a2e0e7a2a2e0e7a2a2',
    color: '#3b82f6' 
  },
  { 
    id: 3, 
    title: 'STAY', 
    artist: 'The Kid LAROI', 
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/04/79/10/35/700_F_479103576_q7p9j3yv5Qp5pXy8x9y0y1u2A3B4C5D6_ST.mp4',
    color: '#a855f7' 
  },
  { 
    id: 4, 
    title: 'Solar Power', 
    artist: 'Lorde', 
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/03/61/15/87/700_F_361158756_EwXbZcR8L9K0E4o5R6A7p8O9L0X1Y2Z3_ST.mp4',
    color: '#ec4899' 
  },
  { 
    id: 5, 
    title: 'Save Your Tears', 
    artist: 'The Weeknd', 
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/328941011/music-22920.mp4?width=1280&hash=d3e0e7a2e0e7a2a2e0e7a2a2e0e7a2a2e0e7a2a2',
    color: '#27272a' 
  },
  { 
    id: 6, 
    title: 'Peaches', 
    artist: 'Justin Bieber', 
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/03/61/15/87/700_F_361158756_EwXbZcR8L9K0E4o5R6A7p8O9L0X1Y2Z3_ST.mp4',
    color: '#ef4444' 
  },
  { 
    id: 7, 
    title: 'Levitating', 
    artist: 'Dua Lipa', 
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/04/79/10/35/700_F_479103576_q7p9j3yv5Qp5pXy8x9y0y1u2A3B4C5D6_ST.mp4',
    color: '#10b981' 
  },
  { 
    id: 8, 
    title: 'Blinding Lights', 
    artist: 'The Weeknd', 
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/328941011/music-22920.mp4?width=640&hash=d3e0e7a2e7a2a2e0e7a2a2e0e7a2a2e0e7a2a2',
    color: '#f59e0b' 
  },
  { 
    id: 9, 
    title: 'Mióta elhagytál (Nem vagyok álmos)', 
    artist: 'BSW', 
    cover: 'https://images.unsplash.com/photo-1549213783-8284d03d6c4f?q=80&w=400', 
    videoUrl: 'https://www.dropbox.com/scl/fi/9n642b1i715j5xbge6nrb/BSW-Mi-ta-elhagyt-l-Nem-vagyok-lmos.mp4?rlkey=s9s1oqmfupwh63awib64d04mg&st=lwvdqvto&dl=1',
    color: '#1a1a1a' 
  },
  { 
    id: 10, 
    title: 'YAAY', 
    artist: 'BSW', 
    cover: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/04/79/10/35/700_F_479103576_q7p9j3yv5Qp5pXy8x9y0y1u2A3B4C5D6_ST.mp4',
    color: '#eab308' 
  },
  { 
    id: 11, 
    title: 'Gucci', 
    artist: 'BSW', 
    cover: 'https://images.unsplash.com/photo-1621272036047-bb0f76bbc1ad?q=80&w=400', 
    videoUrl: 'https://v.ftcdn.net/03/61/15/87/700_F_361158756_EwXbZcR8L9K0E4o5R6A7p8O9L0X1Y2Z3_ST.mp4',
    color: '#10b981' 
  },
  { 
    id: 12, 
    title: 'Még egyszer', 
    artist: 'BSW', 
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/328941011/music-22920.mp4?width=640',
    color: '#8b5cf6' 
  }
];
