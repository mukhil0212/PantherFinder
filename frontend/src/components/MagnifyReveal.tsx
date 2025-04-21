"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MagnifyReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!revealed && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[2000]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <motion.div
              initial={{ scale: 0.1 }}
              animate={{ scale: 7.5, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              style={{ originX: 0.5, originY: 0.5 }}
            >
              {/* Magnifying glass SVG */}
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="55" cy="55" r="35" stroke="#2563eb" strokeWidth="8" fill="#fff" />
                <rect x="80" y="80" width="24" height="8" rx="4" transform="rotate(45 80 80)" fill="#2563eb" />
                <circle cx="55" cy="55" r="20" fill="#e0e7ff" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.3s' }}>
        {children}
      </div>
    </>
  );
}
