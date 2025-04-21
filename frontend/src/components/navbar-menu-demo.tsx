"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/utils/cn";
import Link from "next/link";
import MagnifyLink from "./MagnifyLink";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center py-4 bg-transparent transition-colors duration-500">
      <Navbar className="top-0" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();

  // Create a debounced version of setActive for closing the menu
  // This helps prevent the menu from closing too quickly when moving between items
  const debouncedSetActive = (item: string | null) => {
    if (item === null) {
      // Small delay before closing the menu
      setTimeout(() => {
        setActive(null);
      }, 100);
    } else {
      // Immediately open the menu
      setActive(item);
    }
  };

  return (
    <div
      className={cn("fixed top-0 inset-x-0 max-w-6xl mx-auto z-50 px-4", className)}
    >
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 90, damping: 12 }}>
        <Menu setActive={debouncedSetActive}>
          <MagnifyLink href="/" className="mr-6 flex items-center gap-2 group/logo">
            <img src="/logo.png" alt="PantherFinder Logo" className="h-10 w-10 rounded-full shadow-lg border-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-black transition-all duration-300 group-hover/logo:scale-105" />
            <span className="font-black text-2xl tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm hover:tracking-wider transition-all duration-200">PantherFinder</span>
          </MagnifyLink>
          <div className="flex-1 flex justify-center space-x-6">
            <MenuItem setActive={debouncedSetActive} active={active} item="Items">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/items">Browse Items</HoveredLink>
                {isAuthenticated && (
                  <>
                    <HoveredLink href="/submit-item">Submit Found Item</HoveredLink>
                    <HoveredLink href="/submit-lost-item">Report Lost Item</HoveredLink>
                    <HoveredLink href="/my-items">My Items</HoveredLink>
                    <HoveredLink href="/my-claims">My Claims</HoveredLink>
                    <HoveredLink href="/messages">Messages</HoveredLink>
                  </>
                )}
              </div>
            </MenuItem>
            <MenuItem setActive={debouncedSetActive} active={active} item="Categories">
              <div className="grid grid-cols-2 gap-10 p-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2">Common Categories</h4>
                  <div className="flex flex-col space-y-2">
                    <HoveredLink href="/items?category=Electronics">Electronics</HoveredLink>
                    <HoveredLink href="/items?category=Clothing">Clothing</HoveredLink>
                    <HoveredLink href="/items?category=Books">Books</HoveredLink>
                    <HoveredLink href="/items?category=Personal%20Items">Personal Items</HoveredLink>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Locations</h4>
                  <div className="flex flex-col space-y-2">
                    <HoveredLink href="/items?location=Library">Library</HoveredLink>
                    <HoveredLink href="/items?location=Langdale%20Hall">Langdale Hall</HoveredLink>
                    <HoveredLink href="/items?location=Aderhold">Aderhold</HoveredLink>
                    <HoveredLink href="/items?location=Recreation%20Center">Recreation Center</HoveredLink>
                    <HoveredLink href="/items?location=Student%20Center%20West">Student Center West</HoveredLink>
                  </div>
                </div>
              </div>
            </MenuItem>
            <MenuItem setActive={debouncedSetActive} active={active} item="Account">
              <div className="flex flex-col space-y-4 text-sm">
                {isAuthenticated ? (
                  <>
                    <HoveredLink href="/dashboard">Dashboard</HoveredLink>
                    <HoveredLink href="/profile">Profile</HoveredLink>
                    <HoveredLink href="/notifications">Notifications</HoveredLink>
                    <HoveredLink href="#" onClick={() => logout()}>Logout</HoveredLink>
                  </>
                ) : (
                  <>
                    <HoveredLink href="/auth/login">Login</HoveredLink>
                    <HoveredLink href="/auth/register">Register</HoveredLink>
                  </>
                )}
              </div>
            </MenuItem>
          </div>
          <div className="flex items-center space-x-4 ml-6">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold shadow-md hover:bg-blue-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold shadow-md hover:bg-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold shadow-md hover:bg-blue-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Login</Link>
            )}
          </div>
        </Menu>
      </motion.div>
    </div>
  );
}
