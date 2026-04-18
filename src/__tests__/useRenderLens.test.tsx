import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { __resetLayerForTests, getEntries } from "../layer";
import { useRenderLens, type UseRenderLensOptions } from "../useRenderLens";

afterEach(() => {
  __resetLayerForTests();
});

function findEntry(label: string) {
  for (const entry of getEntries().values()) {
    if (entry.label === label) return entry;
  }
  return undefined;
}

function Tracked({
  label = "X",
  options,
}: {
  label?: string;
  options?: UseRenderLensOptions;
}) {
  const ref = useRenderLens(label, options);
  const [n, setN] = useState(0);
  return (
    <div ref={ref} data-testid="tracked">
      <button type="button" onClick={() => setN((v) => v + 1)}>
        bump {n}
      </button>
    </div>
  );
}

describe("useRenderLens", () => {
  it("defaults to the renders metric", () => {
    render(<Tracked />);
    const entry = findEntry("X");
    expect(entry).toBeDefined();
    expect(entry?.metric).toBe("renders");
    expect(entry?.count).toBe(1);
    expect(entry?.target).toBeInstanceOf(HTMLElement);
  });

  it("increments count on each re-render when tracking renders", () => {
    render(<Tracked />);
    expect(findEntry("X")?.count).toBe(1);

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(findEntry("X")?.count).toBe(2);

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(findEntry("X")?.count).toBe(3);
  });

  it("counts commits when metric: 'commits' is set", async () => {
    render(<Tracked options={{ metric: "commits" }} />);
    expect(findEntry("X")?.metric).toBe("commits");
    expect(findEntry("X")?.count).toBe(1);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(findEntry("X")?.count).toBe(2);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(findEntry("X")?.count).toBe(3);
  });

  it("returns a stable ref callback across renders", () => {
    const seen = new Set<unknown>();
    function Inspector() {
      const ref = useRenderLens("Inspector");
      seen.add(ref);
      const [n, setN] = useState(0);
      return (
        <div ref={ref}>
          <button type="button" onClick={() => setN(n + 1)}>
            bump
          </button>
        </div>
      );
    }
    render(<Inspector />);
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(seen.size).toBe(1);
  });

  it("tracks each component instance separately by label", () => {
    render(
      <>
        <Tracked label="A" />
        <Tracked label="B" />
      </>,
    );
    expect(findEntry("A")?.count).toBe(1);
    expect(findEntry("B")?.count).toBe(1);
  });

  it("unregisters its entry when the component unmounts", () => {
    const { unmount } = render(<Tracked />);
    expect(findEntry("X")).toBeDefined();

    unmount();
    expect(findEntry("X")).toBeUndefined();
  });
});
