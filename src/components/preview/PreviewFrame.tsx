"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";

export function PreviewFrame({ children, label }: { children: ReactNode; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const update = () => {
      if (!host.current) return;
      setScale(Math.min(host.current.clientWidth / SLIDE_WIDTH, 0.48));
    };
    const observer = new ResizeObserver(update);
    if (host.current) observer.observe(host.current);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="preview-card">
      <div className="preview-label">{label}</div>
      <div ref={host} className="preview-host" style={{ height: SLIDE_HEIGHT * scale }}>
        <div className="preview-transform" style={{ transform: `scale(${scale})` }}>{children}</div>
      </div>
    </div>
  );
}
