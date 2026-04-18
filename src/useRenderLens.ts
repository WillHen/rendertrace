import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { isProduction } from "./isProduction";
import { getLayer, registerLens, unregisterLens, updateLens } from "./layer";

const IS_PROD = isProduction();
const NOOP_REF = (): void => {};

export type RenderLensRef = (element: HTMLElement | null) => void;
export type RenderLensMetric = "renders" | "commits";

export interface UseRenderLensOptions {
  metric?: RenderLensMetric;
}

export function useRenderLens(
  label: string,
  options?: UseRenderLensOptions,
): RenderLensRef {
  const metric: RenderLensMetric = options?.metric ?? "renders";

  const countRef = useRef(0);
  const idRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef(label);
  const metricRef = useRef(metric);

  if (!IS_PROD) {
    labelRef.current = label;
    metricRef.current = metric;
    if (idRef.current === null) {
      idRef.current = registerLens();
    }
    if (metric === "renders") {
      countRef.current += 1;
    }
  }

  useLayoutEffect(() => {
    if (IS_PROD) return;
    const id = idRef.current;
    if (id === null) return;
    updateLens(id, {
      label,
      metric,
      count: countRef.current,
      target: targetRef.current,
    });
  });

  useEffect(() => {
    if (IS_PROD) return;
    if (metricRef.current === "commits") {
      countRef.current += 1;
      const id = idRef.current;
      if (id !== null) {
        updateLens(id, {
          label: labelRef.current,
          metric: metricRef.current,
          count: countRef.current,
          target: targetRef.current,
        });
      }
    }
  });

  useEffect(() => {
    if (IS_PROD) return;
    getLayer();
    const id = idRef.current;
    return () => {
      if (id !== null) unregisterLens(id);
    };
  }, []);

  const setRef = useCallback<RenderLensRef>((element) => {
    if (IS_PROD) return;
    targetRef.current = element;
    const id = idRef.current;
    if (id !== null) {
      updateLens(id, {
        label: labelRef.current,
        metric: metricRef.current,
        count: countRef.current,
        target: element,
      });
      getLayer();
    }
  }, []);

  return IS_PROD ? NOOP_REF : setRef;
}
