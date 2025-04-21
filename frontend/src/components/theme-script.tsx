"use client";
import { useEffect } from "react";

const storageKey = "theme";

export default function ThemeScript() {
  useEffect(() => {
    // Read persisted theme or system
    let theme = "system";
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem(storageKey);
      if (persisted) {
        theme = persisted;
      }
    }
    let appliedTheme = theme;
    if (theme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(appliedTheme);
  }, []);
  return null;
}
