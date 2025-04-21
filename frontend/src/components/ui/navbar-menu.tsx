"use client";
import React from "react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// Longer animation duration for menu items
const menuTransition = {
  type: "spring",
  duration: 0.5,
  bounce: 0.2,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  // Use a ref to track if the mouse is over the menu item
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Handle mouse enter with a slight delay to prevent accidental triggers
  const handleMouseEnter = React.useCallback(() => {
    // Small delay to prevent accidental hover
    const timer = setTimeout(() => {
      if (itemRef.current) {
        setActive(item);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [item, setActive]);

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onClick={() => setActive(active === item ? null : item)} // Toggle on click
      className="relative group"
    >
      <motion.p
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.97 }}
        className="cursor-pointer text-black dark:text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 bg-opacity-0 group-hover:bg-opacity-80 group-hover:shadow-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="relative">
          {item}
          {active === item && (
            <motion.span
              layoutId="menu-underline"
              className="absolute left-0 right-0 -bottom-1 h-[3px] rounded bg-blue-500 dark:bg-blue-400"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </span>
      </motion.p>
      <AnimatePresence mode="wait">
        {active === item && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={menuTransition}
            className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4 z-50 min-w-[220px]"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it
          >
            <div className="bg-white dark:bg-black/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-black/[0.12] dark:border-white/[0.15] shadow-2xl animate-fadeIn">
              <div className="w-max h-full p-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  // Add a click handler to the document to close the menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if the click is outside the menu
      if (!target.closest('nav')) {
        setActive(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [setActive]);

  // Use a ref to track if the mouse is over the menu
  const menuRef = React.useRef<HTMLElement>(null);

  // Handle mouse leave with a slight delay to prevent accidental triggers
  const handleMouseLeave = React.useCallback(() => {
    // Small delay to prevent accidental leave
    const timer = setTimeout(() => {
      if (!menuRef.current?.matches(':hover')) {
        setActive(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [setActive]);

  return (
    <nav
      ref={menuRef}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full border border-transparent dark:bg-black/80 dark:border-white/[0.15] bg-white/90 shadow-lg flex items-center justify-between px-10 py-4 backdrop-blur-lg transition-all duration-200"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export function HoveredLink({ children, ...rest }: any) {
  return (
    <motion.a
      {...rest}
      className="transition-all duration-150 hover:pl-2 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-1 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.a>
  );
}
