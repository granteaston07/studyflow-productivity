import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal';

const ACCENT_COLORS: Record<AccentColor, { label: string; swatch: string; light: string; dark: string; lightFg: string; darkFg: string }> = {
  purple: {
    label: 'Purple',
    swatch: '#7c3aed',
    light: '263 70% 58%',
    dark:  '263 75% 65%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
  blue: {
    label: 'Blue',
    swatch: '#2563eb',
    light: '221 83% 53%',
    dark:  '221 83% 62%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
  green: {
    label: 'Green',
    swatch: '#16a34a',
    light: '142 71% 40%',
    dark:  '142 64% 52%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
  orange: {
    label: 'Orange',
    swatch: '#ea580c',
    light: '24 95% 46%',
    dark:  '24 95% 58%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
  pink: {
    label: 'Pink',
    swatch: '#db2777',
    light: '330 81% 52%',
    dark:  '330 81% 62%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
  teal: {
    label: 'Teal',
    swatch: '#0d9488',
    light: '174 72% 32%',
    dark:  '174 72% 46%',
    lightFg: '0 0% 100%',
    darkFg: '240 8% 6%',
  },
};

const STORAGE_KEY = 'propel_accent_color';

interface AccentColorContext {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  accentColors: typeof ACCENT_COLORS;
}

const AccentColorContext = createContext<AccentColorContext>({
  accentColor: 'purple',
  setAccentColor: () => null,
  accentColors: ACCENT_COLORS,
});

function applyAccent(color: AccentColor) {
  const root = document.documentElement;
  const def = ACCENT_COLORS[color];
  const isDark = root.classList.contains('dark');
  const val = isDark ? def.dark : def.light;
  const fg = isDark ? def.darkFg : def.lightFg;
  root.style.setProperty('--primary', val);
  root.style.setProperty('--primary-foreground', fg);
  root.style.setProperty('--ring', val);
  root.style.setProperty('--sidebar-primary', val);
  root.style.setProperty('--sidebar-ring', val);
  // Accent (light tint)
  const [h, s] = val.split(' ');
  if (isDark) {
    root.style.setProperty('--accent', `${h} ${parseInt(s) * 0.5}% 18%`);
  } else {
    root.style.setProperty('--accent', `${h} ${parseInt(s) * 0.9}% 92%`);
  }
}

export function AccentColorProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (localStorage.getItem(STORAGE_KEY) as AccentColor) || 'purple'
  );

  const setAccentColor = (color: AccentColor) => {
    localStorage.setItem(STORAGE_KEY, color);
    setAccentColorState(color);
    applyAccent(color);
  };

  // Re-apply when theme class changes (dark/light switch)
  useEffect(() => {
    const observer = new MutationObserver(() => applyAccent(accentColor));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    applyAccent(accentColor);
    return () => observer.disconnect();
  }, [accentColor]);

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor, accentColors: ACCENT_COLORS }}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useAccentColor() {
  return useContext(AccentColorContext);
}
