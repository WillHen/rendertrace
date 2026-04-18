# RenderTrace

A tiny React devtool that pins a render-count pill to any component you annotate.
Drop in a hook, get a live visual counter of how many times that component has
rendered. Meant for hunting down wasted re-renders during development.

```
┌─────────────┐
│ Header   [3]│  ← pill in the corner of the annotated element
│  content    │
└─────────────┘
```

## Install

```bash
npm install rendertrace
# or: pnpm add rendertrace / yarn add rendertrace
```

Peer deps: `react >= 18`, `react-dom >= 18`.

## Quick start

```tsx
import { useRenderTrace } from "rendertrace";

function Header({ title }: { title: string }) {
  const ref = useRenderTrace("Header");
  return <header ref={ref}>{title}</header>;
}
```

That's it. Every time `Header` renders, the pill updates. Attach the returned
ref to the DOM node you want the pill anchored to — RenderTrace positions itself
in the top-right corner of that element. The pill shows `Header · 3r` — the
`r` suffix means it's counting **renders** (React invocations of your
component function).

### Renders vs. commits

By default RenderTrace counts **renders** (how many times React called your
component function). Pass `metric: 'commits'` to count **commits** instead
(how many times React actually applied a DOM update for this component):

```tsx
const ref = useRenderTrace("Header", { metric: "commits" });
// pill shows "Header · 3c"
```

When would you choose which?
- **Renders** is the "React did work" metric. Spot wasted function invocations
  — e.g. a parent re-rendering and forcing children through reconciliation
  even when their output is unchanged. Best for hunting memoization gaps.
- **Commits** is the "DOM actually changed" metric. Filters out renders React
  bailed out of. Best for understanding visible update frequency.

In a vanilla React app without `<StrictMode>` or concurrent aborts they'll
track. Divergence is an interesting signal — it means React rendered but
didn't commit.

## Production behavior

When `process.env.NODE_ENV === "production"`, the hook is a no-op: it returns a
ref callback that does nothing and mounts no DOM. Your bundler can tree-shake
the overlay code away, so shipping RenderTrace calls to production is safe by
default.

If you want to force-disable it in development too, simply don't call the hook.

## Roadmap

RenderTrace is intentionally small. Near-term features being designed:

- **Props diff** — show which props changed between renders, inline in the pill
  tooltip.
- **Unstable-reference detection** — flag object/function props whose identity
  changed but whose value is structurally equal (the classic
  `onClick={() => ...}` footgun).
- **Render duration** — integrate `React.Profiler` to surface `actualDuration`
  per render alongside the count.
- **Aggregated dev panel** — a single draggable panel listing every tracked
  component's counts and durations.

## Playground

A local playground lives in `playground/`:

```bash
pnpm install
pnpm --filter rendertrace-playground install
pnpm --filter rendertrace-playground dev
```

## Caveats

- React 18 `<StrictMode>` double-invokes render in development. With the
  default `metric: 'renders'`, the counter will therefore tick by 2 per commit
  under `<StrictMode>`. This is a React-level behavior — it's what StrictMode
  is designed to do. Switch to `metric: 'commits'` if you'd rather count
  visible updates instead (it still shows 2 on the initial mount under
  StrictMode because StrictMode simulates a mount→unmount→remount cycle, but
  subsequent updates tick by 1).
- The hook relies on a ref attached to a real DOM element. Components that
  return `null` or fragments with no stable root can't be measured — wrap them
  in a host element to track them.

## License

MIT
