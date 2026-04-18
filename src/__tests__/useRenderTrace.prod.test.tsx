import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../isProduction", () => ({
  isProduction: () => true,
}));

const { useRenderTrace } = await import("../useRenderTrace");

describe("useRenderTrace in production", () => {
  it("does not mount a pill or layer", () => {
    function C() {
      const ref = useRenderTrace("Label");
      return <div ref={ref}>hello</div>;
    }
    render(<C />);
    expect(document.querySelector("[data-rendertrace-pill]")).toBeNull();
    expect(document.querySelector("[data-rendertrace-layer]")).toBeNull();
  });
});
