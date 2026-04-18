import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TraceMetric } from "./layer";

interface OverlayProps {
  label: string;
  metric: TraceMetric;
  count: number;
  target: HTMLElement | null;
}

interface Rect {
  top: number;
  left: number;
  width: number;
}

const PORTAL_ATTR = "data-rendertrace-root";

function getPortalRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const existing = document.querySelector<HTMLElement>(`[${PORTAL_ATTR}]`);
  if (existing) return existing;
  const node = document.createElement("div");
  node.setAttribute(PORTAL_ATTR, "");
  document.body.appendChild(node);
  return node;
}

function measure(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width };
}

export function Overlay({ label, metric, count, target }: OverlayProps) {
  const [rect, setRect] = useState<Rect | null>(() =>
    target ? measure(target) : null,
  );
  const portalRoot = getPortalRoot();

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const update = () => setRect(measure(target));
    update();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    resizeObserver?.observe(target);

    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [target]);

  if (!portalRoot || !rect) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.max(0, rect.top + 4),
    left: Math.max(0, rect.left + rect.width - 8),
    transform: "translateX(-100%)",
    zIndex: 2147483000,
    pointerEvents: "none",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 10,
    lineHeight: "14px",
    padding: "2px 6px",
    borderRadius: 999,
    background: "rgba(15, 15, 20, 0.85)",
    color: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
    letterSpacing: 0.2,
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  return createPortal(
    <div data-rendertrace-pill={label} style={style}>
      {label} · {count}
      {metric === "commits" ? "c" : "r"}
    </div>,
    portalRoot,
  );
}
