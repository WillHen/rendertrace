import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../isProduction", () => ({
  isProduction: () => true,
}));

const { useRenderLens } = await import("../useRenderLens");

describe("useRenderLens in production", () => {
  it("does not mount a pill or layer", () => {
    function C() {
      const ref = useRenderLens("Label");
      return <div ref={ref}>hello</div>;
    }
    render(<C />);
    expect(document.querySelector("[data-renderlens-pill]")).toBeNull();
    expect(document.querySelector("[data-renderlens-layer]")).toBeNull();
  });
});
