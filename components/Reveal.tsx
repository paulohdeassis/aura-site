"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  /** ms delay before this element animates in — use to stagger siblings */
  delay?: number;
  /** ms duration of the entrance */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  /** initial (hidden) state; defaults to a 26px upward slide + fade */
  from?: CSSProperties;
};

const DEFAULT_FROM: CSSProperties = {
  opacity: 0,
  transform: "translateY(26px)",
};

/**
 * Reveals its children once they scroll into view. Honors
 * prefers-reduced-motion by showing content immediately.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 700,
  className,
  style,
  from,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // Reading a browser preference on mount is a valid effect-driven sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = from ?? DEFAULT_FROM;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(shown ? { opacity: 1, transform: "none" } : hidden),
        transition: `opacity ${duration}ms var(--ease-out-quint) ${delay}ms, transform ${duration}ms var(--ease-out-quint) ${delay}ms`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
