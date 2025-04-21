"use client";
import { useMagnifyTransition } from "@/components/MagnifyTransitionContext";

export default function ClientZoomWrapper({ children }: { children: React.ReactNode }) {
  const { phase } = useMagnifyTransition();
  let scale = 1;
  let opacity = 1;
  if (phase === "zoom-in") {
    scale = 1.12;
    opacity = 0.92;
  } else if (phase === "zoom-out") {
    scale = 0.92;
    opacity = 0.88;
  }
  return (
    <>
      {children}
    </>
  );
}
