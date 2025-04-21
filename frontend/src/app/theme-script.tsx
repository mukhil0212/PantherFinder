'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // Check if we have a stored theme
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
      // Apply the stored theme
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(storedTheme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : storedTheme
      );
    }
  }, []);
  
  return null;
}
