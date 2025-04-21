"use client";

import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    setMounted(true);

    // Check the actual theme applied to the document
    const isDark = document.documentElement.classList.contains('dark');
    setCurrentTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log('[ThemeToggle] Context theme:', theme);
      console.log('[ThemeToggle] Current DOM theme:', currentTheme);
    }
  }, [theme, currentTheme, mounted]);

  // Update current theme when document class changes
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setCurrentTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [mounted]);

  // Early return for server-side rendering
  if (!mounted) {
    return <div className="w-9 h-9"></div>; // Placeholder with same dimensions
  }

  // Functions must be defined after all hooks but before the return statement
  function toggleTheme() {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    console.log('[ThemeToggle] Toggling theme from', currentTheme, 'to', newTheme);

    // Apply the theme directly to ensure immediate feedback
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);

    // Update local state immediately for UI feedback
    setCurrentTheme(newTheme);

    // Also update the theme in the context
    setTheme(newTheme);
  }

  // The sun icon for dark mode (switching to light)
  const SunIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 transition-transform duration-300 ease-in-out"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );

  // The moon icon for light mode (switching to dark)
  const MoonIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 transition-transform duration-300 ease-in-out"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  );

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label="Toggle theme"
    >
      {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
