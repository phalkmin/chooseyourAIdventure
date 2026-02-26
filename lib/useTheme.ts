'use client';

import { useState } from 'react';

export type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('adventure-theme');
  return saved === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  // Lazy initializer reads localStorage synchronously — no extra render cycle on mount
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('adventure-theme', newTheme);
  };

  return { theme, toggleTheme };
}
