import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Overlay } from "../Overlay";

function makeTarget(rect: Partial<DOMRect>) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  el.getBoundingClientRect = () =>
    ({
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect;
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Overlay", () => {
  it("renders a pill suffixed with r for the renders metric", () => {
    const target = makeTarget({ top: 100, left: 50, width: 200 });
    render(<Overlay label="Foo" metric="renders" count={3} target={target} />);

    expect(document.querySelector("[data-rendertrace-root]")).not.toBeNull();
    const pill = document.querySelector<HTMLElement>(
      '[data-rendertrace-pill="Foo"]',
    );
    expect(pill?.textContent).toBe("Foo · 3r");
  });

  it("renders a pill suffixed with c for the commits metric", () => {
    const target = makeTarget({ top: 10, left: 10, width: 100 });
    render(<Overlay label="Bar" metric="commits" count={5} target={target} />);
    expect(
      document.querySelector('[data-rendertrace-pill="Bar"]')?.textContent,
    ).toBe("Bar · 5c");
  });

  it("updates text when count changes", () => {
    const target = makeTarget({ top: 10, left: 10, width: 100 });
    const { rerender } = render(
      <Overlay label="Baz" metric="renders" count={1} target={target} />,
    );
    expect(
      document.querySelector('[data-rendertrace-pill="Baz"]')?.textContent,
    ).toBe("Baz · 1r");

    rerender(
      <Overlay label="Baz" metric="renders" count={7} target={target} />,
    );
    expect(
      document.querySelector('[data-rendertrace-pill="Baz"]')?.textContent,
    ).toBe("Baz · 7r");
  });

  it("renders nothing when target is null", () => {
    render(<Overlay label="None" metric="renders" count={1} target={null} />);
    expect(document.querySelector('[data-rendertrace-pill="None"]')).toBeNull();
  });
});
