# RenderLens — contributor notes for Claude

RenderLens is a publishable React devtool package. The root directory *is* the
publishable package; `playground/` is a local Vite demo, not published.

## Commits

- Use **Conventional Commits** (`type(scope): subject`).
  - `feat:` new user-facing capability
  - `fix:` bug fix
  - `chore:` tooling, deps, config
  - `docs:` README/comments only
  - `refactor:` no behavior change
  - `test:` tests only
- Keep the subject ≤72 chars, imperative mood ("add", not "added").
- One logical change per commit.

## Before committing

- `pnpm test` — must pass.
- `pnpm typecheck` — must pass.
- `pnpm build` — must succeed if public API or exports changed.

## Before publishing

Never run `npm publish` without explicit user confirmation. Before publish:

1. Bump version in `package.json` (or use Changesets once wired up).
2. `pnpm build && npm pack` and inspect the tarball contents (dist/, README,
   LICENSE, package.json only — no src, no tests, no playground).
3. Ask the user before running `npm publish`.

## Package manager

- Library: `pnpm` (locked by `pnpm-lock.yaml`).
- Consuming projects in the wild typically use `npm` — don't assume pnpm in
  install instructions for users. Keep README examples npm-first.

## Architecture quick-reference

- `src/useRenderLens.ts` — public hook. Returns a callback ref.
- `src/Overlay.tsx` — pill component, portaled to `document.body`.
- `src/layer.tsx` — detached React root + module-level entry store.
- `src/isProduction.ts` — `NODE_ENV === "production"` check.
- Detached root is suppressed under `IS_REACT_ACT_ENVIRONMENT` so consumer
  tests don't see `act()` warnings.

## Roadmap

Phase-by-phase plan lives at
`~/.claude/plans/we-are-going-to-adaptive-gray.md`. Phase 1 (MVP) is complete;
phases 2–5 cover props diff, unstable-ref detection, Profiler timings, and an
aggregated dev panel.
