"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useMagnifyTransition } from "./MagnifyTransitionContext";

export default function MagnifyLink({ href, children, className = "", ...props }: any) {
  const router = useRouter();
  const { trigger, isActive } = useMagnifyTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      trigger({ x, y, onComplete: () => router.push(href) });
    } else {
      router.push(href);
    }
  };

  return (
    <button
      ref={btnRef}
      className={className}
      onClick={handleClick}
      {...props}
      style={{ position: 'relative', zIndex: 10 }}
      disabled={isActive}
    >
      {children}
    </button>
  );
}
