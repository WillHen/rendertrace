# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-18

### Added

- `useRenderLens(label, options)` hook that attaches a callback ref to any React element and tracks how many times it renders or commits
- `metric` option (`"renders"` | `"commits"`) on `useRenderLens` to choose whether the counter increments on every render or only on DOM commits
- Overlay pill displayed in a fixed position over each tracked element showing the label and current count, portaled to `document.body` and repositioned on scroll and resize
- Automatic no-op behavior in production (`NODE_ENV === "production"`), so the hook and overlay add zero overhead when shipped