"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/context/AuthContext";

export default function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center py-4">
      <Navbar className="top-0" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div
      className={cn("fixed top-0 inset-x-0 max-w-6xl mx-auto z-50 px-4", className)}
    >
      <Menu setActive={setActive}>
        <Link href="/" className="mr-6">
          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">PantherFinder</span>
        </Link>
        <div className="flex-1 flex justify-center space-x-6">
          <MenuItem setActive={setActive} active={active} item="Items">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/items">Browse Items</HoveredLink>
              <HoveredLink href="/submit-item">Submit Item</HoveredLink>
              {isAuthenticated && (
                <>
                  <HoveredLink href="/my-items">My Items</HoveredLink>
                  <HoveredLink href="/my-claims">My Claims</HoveredLink>
                </>
              )}
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Categories">
            <div className="grid grid-cols-2 gap-10 p-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">Common Categories</h4>
                <div className="flex flex-col space-y-2">
                  <HoveredLink href="/items?category=Electronics">Electronics</HoveredLink>
                  <HoveredLink href="/items?category=Clothing">Clothing</HoveredLink>
                  <HoveredLink href="/items?category=Books">Books</HoveredLink>
                  <HoveredLink href="/items?category=Personal">Personal Items</HoveredLink>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2">Locations</h4>
                <div className="flex flex-col space-y-2">
                  <HoveredLink href="/items?location=Library">Library</HoveredLink>
                  <HoveredLink href="/items?location=Student Union">Student Union</HoveredLink>
                  <HoveredLink href="/items?location=Classroom Building">Classroom Building</HoveredLink>
                  <HoveredLink href="/items?location=Recreation Center">Recreation Center</HoveredLink>
                </div>
              </div>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Account">
            <div className="flex flex-col space-y-4 text-sm">
              {isAuthenticated ? (
                <>
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
        <div className="ml-4">
          <ThemeToggle />
        </div>
      </Menu>
    </div>
  );
}
