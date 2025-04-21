"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function BackgroundBeamsDemo() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-[40rem] w-full relative flex flex-col items-center justify-center antialiased overflow-hidden">
      {/* Background Image for Hero Section Only */}
      <Image
        src="/SM_Dual-Enrollment_BG.jpg"
        alt="Background PantherFinder"
        fill
        priority
        className="object-cover object-center absolute inset-0 z-0 opacity-30 dark:opacity-20 select-none pointer-events-none"
      />
      <BackgroundBeams />
      <div className="max-w-2xl mx-auto p-4 relative z-10">
        <h1 className="text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 text-center font-sans font-bold">
          PantherFinder
        </h1>
        <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto my-6 text-base md:text-lg text-center">
          Lost something on campus? Found something that doesn't belong to you?
          PantherFinder helps connect lost items with their owners.
          Submit found items, search for lost items, and get notified when your lost item is found.
        </p>
        <div className="flex justify-center mt-8 gap-4">
          <Link
            href={isAuthenticated ? "/items" : "/auth/register"}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            {isAuthenticated ? "Browse Items" : "Get Started"}
          </Link>
          <Link
            href="/items"
            className="rounded-lg border border-blue-600 bg-transparent px-6 py-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
