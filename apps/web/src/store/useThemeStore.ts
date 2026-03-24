import { create } from 'zustand';

export interface ThemePalette {
  key: string;
  name: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
}

export const themes: Record<string, ThemePalette> = {
  nord: {
    key: 'nord',
    name: 'Nord',
    background: '#2E3440',
    surface: '#3B4252',
    foreground: '#ECEFF4',
    muted: '#4C566A',
    accent: '#88C0D0',
    border: '#434C5E',
  },
  github: {
    key: 'github',
    name: 'GitHub Dark',
    background: '#0D1117',
    surface: '#161B22',
    foreground: '#C9D1D9',
    muted: '#484F58',
    accent: '#58A6FF',
    border: '#30363D',
  },
  monokai: {
    key: 'monokai',
    name: 'Monokai',
    background: '#272822',
    surface: '#3E3D32',
    foreground: '#F8F8F2',
    muted: '#75715E',
    accent: '#A6E22E',
    border: '#49483E',
  },
  rosepine: {
    key: 'rosepine',
    name: 'Rosé Pine',
    background: '#191724',
    surface: '#1F1D2E',
    foreground: '#E0DEF4',
    muted: '#6E6A86',
    accent: '#C4A7E7',
    border: '#26233A',
  },
  nightrunner: {
    key: 'nightrunner',
    name: 'Night Runner',
    background: '#111317',
    surface: '#1A1D23',
    foreground: '#C5CDD9',
    muted: '#3E4451',
    accent: '#E06C75',
    border: '#282C34',
  },
  moonlight: {
    key: 'moonlight',
    name: 'Moonlight',
    background: '#1E2030',
    surface: '#2F334D',
    foreground: '#C8D3F5',
    muted: '#444A73',
    accent: '#82AAFF',
    border: '#383E5C',
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
  root.style.setProperty('--foreground', palette.foreground);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--accent', palette.accent);
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
