"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  delay?: number;
  /** Pixel offset before the element triggers (default 80) */
  threshold?: number;
  className?: string;
};

export default function Reveal({
  children,
  delay = 0,
  threshold = 80,
  className = ""
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: `0px 0px -${threshold}px 0px`, threshold: 0.01 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown && delay ? `${delay}ms` : "0ms" }}
      className={[
        "transition-all duration-[800ms] ease-[cubic-bezier(0.2,0.65,0.3,1)] motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}
