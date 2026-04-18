import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { isProduction } from "./isProduction";
import { getLayer, register, unregister, update } from "./layer";

const IS_PROD = isProduction();
const NOOP_REF = (): void => {};

export type RenderTraceRef = (element: HTMLElement | null) => void;
export type RenderTraceMetric = "renders" | "commits";

export interface UseRenderTraceOptions {
  metric?: RenderTraceMetric;
}

export function useRenderTrace(
  label: string,
  options?: UseRenderTraceOptions,
): RenderTraceRef {
  const metric: RenderTraceMetric = options?.metric ?? "renders";

  const countRef = useRef(0);
  const idRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef(label);
  const metricRef = useRef(metric);

  if (!IS_PROD) {
    labelRef.current = label;
    metricRef.current = metric;
    if (idRef.current === null) {
      idRef.current = register();
    }
    if (metric === "renders") {
      countRef.current += 1;
    }
  }

  useLayoutEffect(() => {
    if (IS_PROD) return;
    const id = idRef.current;
    if (id === null) return;
    update(id, {
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
        update(id, {
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
      if (id !== null) unregister(id);
    };
  }, []);

  const setRef = useCallback<RenderTraceRef>((element) => {
    if (IS_PROD) return;
    targetRef.current = element;
    const id = idRef.current;
    if (id !== null) {
      update(id, {
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
