"use client";
import React, { createContext, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const MagnifyTransitionContext = createContext({
  trigger: (opts: { x: number; y: number; color?: string; onComplete?: () => void }) => {},
  isActive: false,
  phase: 'idle' | 'zoom-in' | 'zoom-out',
});

export function useMagnifyTransition() {
  return useContext(MagnifyTransitionContext);
}

export function MagnifyTransitionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    x: number;
    y: number;
    color?: string;
    active: boolean;
    onComplete?: () => void;
    phase: 'idle' | 'zoom-in' | 'zoom-out';
    show: boolean;
    overlay: boolean;
  }>({ x: 0, y: 0, color: undefined, active: false, phase: 'idle', show: false, overlay: false });
  const timeoutRef = useRef<any>(null);
  const [pageContent, setPageContent] = useState<HTMLElement | null>(null);

  // Animation timings
  const ZOOM_DURATION = 2000; // even smoother zoom in
  const OUT_DURATION = 2000;  // even smoother zoom out

  // Helper: Check if we should show landing zoom-out
  function shouldLandingZoomOut() {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('magnify-nav') === '1';
  }

  function setLandingZoomOut(val: boolean) {
    if (typeof window === 'undefined') return;
    if (val) sessionStorage.setItem('magnify-nav', '1');
    else sessionStorage.removeItem('magnify-nav');
  }

  React.useEffect(() => {
    // Use document.body as portal target for overlays
    setPageContent(typeof window !== 'undefined' ? document.body : null);
    // On mount, check if we should show landing zoom-out
    if (shouldLandingZoomOut()) {
      setLandingZoomOut(false);
      setState((s) => ({
        ...s,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        phase: 'zoom-out',
        show: true,
        overlay: true,
        active: true,
      }));
      setTimeout(() => {
        setState((s) => ({ ...s, active: false, phase: 'idle', show: false, overlay: false }));
      }, OUT_DURATION);
    }
    if (typeof window !== 'undefined' && !document.body) {
      console.warn('MagnifyTransition: document.body not found for portal target!');
    }
  }, []);

  // Show magnify-in effect on button click
  const trigger = (opts: { x: number; y: number; color?: string; onComplete?: () => void }) => {
    setLandingZoomOut(true);
    setState((s) => ({ ...s, ...opts, active: true, phase: 'zoom-in', show: true, overlay: true }));
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState((s) => ({ ...s, phase: 'zoom-out', show: false, overlay: false }));
      opts.onComplete?.();
    }, ZOOM_DURATION);
  };

  return (
    <MagnifyTransitionContext.Provider value={{ trigger, isActive: state.active, phase: state.phase }}>
      {children}
      {state.overlay && pageContent && createPortal(
        <div className="fixed inset-0 z-[4000] pointer-events-none">
          <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-100" />
        </div>,
        pageContent
      )}
      {state.show && pageContent && createPortal(
        <AnimatePresence>
          <motion.div
            key={`magnify-glass-${state.phase}`}
            initial={state.phase === 'zoom-in' ? { scale: 1, opacity: 1 } : { scale: 7, opacity: 1 }}
            animate={state.phase === 'zoom-in' ? { scale: 7, opacity: 0.2 } : { scale: 1, opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } }}
            transition={{ duration: 2, ease: [0.42, 0, 0.58, 1] }}
            style={{
              position: 'fixed',
              left: state.x - 60,
              top: state.y - 60,
              width: 120,
              height: 120,
              zIndex: 4010,
              pointerEvents: 'none',
              originX: 0.5,
              originY: 0.5,
            }}
          >
            {/* Magnified content through the lens */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: -(state.x - 60),
                  top: -(state.y - 60),
                  width: '100vw',
                  height: '100vh',
                  transform: state.phase === 'zoom-in'
                    ? 'scale(1.3)'
                    : state.phase === 'zoom-out'
                    ? 'scale(0.7)'
                    : 'scale(1)',
                  transition: 'transform 2s cubic-bezier(0.42,0,0.58,1)',
                  pointerEvents: 'none',
                }}
              >
                {/* Render a blank or themed background, not a DOM node */}
                <div style={{width: '100vw', height: '100vh', background: 'inherit'}} />
              </div>
            </div>
            {/* Magnifying glass SVG overlay */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 2 }}>
              {/* Black rim */}
              <circle cx="55" cy="55" r="35" stroke="#111" strokeWidth="8" fill="none" />
              {/* Glass center (translucent white) */}
              <circle cx="55" cy="55" r="27" fill="white" fillOpacity="0.65" />
              {/* Black handle */}
              <rect x="80" y="80" width="24" height="8" rx="4" transform="rotate(45 80 80)" fill="#111" />
              {/* Glass shine */}
              <ellipse cx="50" cy="48" rx="10" ry="5" fill="white" fillOpacity="0.35" />
            </svg>
          </motion.div>
        </AnimatePresence>,
        pageContent
      )}
    </MagnifyTransitionContext.Provider>
  );
}
