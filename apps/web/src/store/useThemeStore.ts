import { create } from 'zustand';

export interface ThemePalette {
  key: string;
  name: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  foreground: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
}

export const themes: Record<string, ThemePalette> = {
  nord: {
    key: 'nord',
    name: 'Nord Atelier',
    background: '#161B26',
    surface: '#202839',
    surfaceAlt: '#2A3449',
    foreground: '#ECF2FF',
    muted: '#8A96AF',
    accent: '#8FD3FF',
    accentSoft: 'rgba(143, 211, 255, 0.18)',
    border: '#31405A',
  },
  github: {
    key: 'github',
    name: 'Midnight Graphite',
    background: '#0C1118',
    surface: '#131B25',
    surfaceAlt: '#1C2633',
    foreground: '#DCE6F2',
    muted: '#7B8798',
    accent: '#58B6FF',
    accentSoft: 'rgba(88, 182, 255, 0.18)',
    border: '#283548',
  },
  monokai: {
    key: 'monokai',
    name: 'Citrus Lab',
    background: '#171714',
    surface: '#22211C',
    surfaceAlt: '#2D2A22',
    foreground: '#F8F5EA',
    muted: '#AAA184',
    accent: '#D8F171',
    accentSoft: 'rgba(216, 241, 113, 0.18)',
    border: '#3C392D',
  },
  rosepine: {
    key: 'rosepine',
    name: 'Rose Pine',
    background: '#17141F',
    surface: '#211C2C',
    surfaceAlt: '#2B2439',
    foreground: '#F1EAFE',
    muted: '#9D91B8',
    accent: '#F0A6CA',
    accentSoft: 'rgba(240, 166, 202, 0.18)',
    border: '#3A304B',
  },
  nightrunner: {
    key: 'nightrunner',
    name: 'Afterglow',
    background: '#121316',
    surface: '#1A1D22',
    surfaceAlt: '#242932',
    foreground: '#E7EDF8',
    muted: '#8A92A3',
    accent: '#FF8A65',
    accentSoft: 'rgba(255, 138, 101, 0.18)',
    border: '#313845',
  },
  moonlight: {
    key: 'moonlight',
    name: 'Moonlight',
    background: '#161A2B',
    surface: '#202744',
    surfaceAlt: '#2A3460',
    foreground: '#DCE5FF',
    muted: '#95A1CE',
    accent: '#9AC2FF',
    accentSoft: 'rgba(154, 194, 255, 0.18)',
    border: '#364273',
  },
};

interface ThemeState {
  activeTheme: string;
  setTheme: (key: string) => void;
  hydrate: () => void;
}

function applyTheme(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty('--background', palette.background);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--surface-alt', palette.surfaceAlt);
  root.style.setProperty('--foreground', palette.foreground);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-soft', palette.accentSoft);
  root.style.setProperty('--border', palette.border);
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: 'nord',
  setTheme: (key: string) => {
    const palette = themes[key];
    if (!palette) return;
    applyTheme(palette);
    localStorage.setItem('socratic-theme', key);
    set({ activeTheme: key });
  },
  hydrate: () => {
    const stored = localStorage.getItem('socratic-theme') || 'nord';
    const palette = themes[stored] || themes.nord;
    applyTheme(palette);
    set({ activeTheme: stored });
  },
}));
