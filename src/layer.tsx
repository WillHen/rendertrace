import { act, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { Overlay } from "./Overlay";

export type LensMetric = "renders" | "commits";

export interface LensEntry {
  label: string;
  metric: LensMetric;
  count: number;
  target: HTMLElement | null;
}

const entries = new Map<number, LensEntry>();
const listeners = new Set<() => void>();
let nextId = 1;
let version = 0;
let root: Root | null = null;

const LAYER_ATTR = "data-renderlens-layer";

function emit(): void {
  version += 1;
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const inAct =
    typeof globalThis !== "undefined" &&
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT === true;
  if (inAct) {
    act(() => {
      notify();
    });
  } else {
    notify();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getVersion(): number {
  return version;
}

export function registerLens(): number {
  const id = nextId;
  nextId += 1;
  entries.set(id, {
    label: "",
    metric: "renders",
    count: 0,
    target: null,
  });
  emit();
  return id;
}

export function updateLens(id: number, entry: LensEntry): void {
  const current = entries.get(id);
  if (
    current &&
    current.label === entry.label &&
    current.metric === entry.metric &&
    current.count === entry.count &&
    current.target === entry.target
  ) {
    return;
  }
  entries.set(id, entry);
  emit();
}

export function unregisterLens(id: number): void {
  if (entries.delete(id)) emit();
}

export function getEntries(): ReadonlyMap<number, LensEntry> {
  return entries;
}

function OverlayLayer(): ReactElement {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  const rendered: ReactElement[] = [];
  entries.forEach((entry, id) => {
    if (!entry.target) return;
    rendered.push(
      <Overlay
        key={id}
        label={entry.label}
        metric={entry.metric}
        count={entry.count}
        target={entry.target}
      />,
    );
  });
  return <>{rendered}</>;
}

export function getLayer(): void {
  if (typeof document === "undefined") return;
  if (root) return;
  const inAct =
    typeof globalThis !== "undefined" &&
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT === true;
  if (inAct) return;
  let host = document.querySelector<HTMLElement>(`[${LAYER_ATTR}]`);
  if (!host) {
    host = document.createElement("div");
    host.setAttribute(LAYER_ATTR, "");
    document.body.appendChild(host);
  }
  root = createRoot(host);
  root.render(<OverlayLayer />);
}

export function __resetLayerForTests(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  entries.clear();
  listeners.clear();
  nextId = 1;
  version = 0;
  if (typeof document !== "undefined") {
    document
      .querySelectorAll("[data-renderlens-layer]")
      .forEach((n) => n.remove());
    document
      .querySelectorAll("[data-renderlens-root]")
      .forEach((n) => n.remove());
  }
}
