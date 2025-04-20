"use client";
import React from "react";
import { cn } from "@/utils/cn";

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-20"></div>
      <div className="absolute h-full w-full bg-gradient-radial from-blue-400/20 via-transparent to-transparent blur-2xl"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent"></div>
    </div>
  );
}
