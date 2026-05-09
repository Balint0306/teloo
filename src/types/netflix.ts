export interface Episode {
  episode: number;
  title: string;
  duration: string;
  durationSeconds?: number;
  upNextTriggerSeconds?: number;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
}

export interface Season {
  season: number;
  episodes: Episode[];
  trailerUrl?: string; // for season-specific previews
}

export interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  imageUrl: string;
  description: string;
  year: number;
  duration: string;
  durationSeconds?: number;
  upNextTriggerSeconds?: number;
  genres: string[];
  cast: string[];
  embedUrl?: string; // for movies
  trailerUrl?: string; // for previews
  seasons?: Season[]; // for series
  isNewSeasonAvailable?: boolean;
  isOriginal?: boolean;
}

export type Series = Content & { type: 'series'; seasons: Season[] };
export type Movie = Content & { type: 'movie'; embedUrl: string };
