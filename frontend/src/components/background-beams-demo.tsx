"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AuroraText } from "@/components/ui/aurora-text";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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
        <h1 className="text-lg md:text-7xl bg-clip-text text-transparent text-center font-sans font-bold">
          <AuroraText className="inline-block">PantherFinder</AuroraText>
        </h1>
        <p className="text-[var(--foreground)] max-w-lg mx-auto my-6 text-base md:text-lg text-center">
          Lost something on campus? Found something that doesn't belong to you?
          PantherFinder helps connect lost items with their owners.
          Submit found items, search for lost items, and get notified when your lost item is found.
        </p>
        <div className="flex justify-center mt-8 gap-4">
          <InteractiveHoverButton onClick={() => window.location.href = isAuthenticated ? "/items" : "/auth/register"}>
            {isAuthenticated ? "Browse Items" : "Get Started"}
          </InteractiveHoverButton>
          <InteractiveHoverButton onClick={() => window.location.href = "/items"} className="border-primary bg-transparent">
            Learn More
          </InteractiveHoverButton>
        </div>
      </div>
      {/* Smooth Gradient Fade for Light/Dark Mode at Top */}
      <div className="gradient-fade-top" />
      {/* Smooth Gradient Fade for Light/Dark Mode at Bottom */}
      <div className="gradient-fade-bottom" />
    </div>
  );
}
