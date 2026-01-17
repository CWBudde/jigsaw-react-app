# Repository Guidelines

## Goal
- Build a jigsaw puzzle app in React + TypeScript: canvas-rendered tiles with drag/drop, snapping, rotation, confetti, and victory text per `PLAN.md` migration notes.

## Project Structure & Module Organization
- `src/` holds all React + TypeScript code; keep new components under `src/` in feature folders, and co-locate styles (e.g., `Feature/AppSection.tsx` with `Feature/AppSection.css`).
- `src/assets/` stores static assets imported by components; prefer hashed imports via Vite rather than copying into `public/`.
- `public/` is served as-is at the app root; only place files here if they must be fetched by path (e.g., `favicon.ico`).
- `dist/` is the build output; never edit by hand.
- Config lives at the root (`tsconfig*.json`, `eslint.config.js`, `vite.config.ts`); adjust these instead of ad-hoc overrides.

## Build, Test, and Development Commands
- `yarn install` to set up dependencies (Yarn 4, zero-install friendly via `.yarn/`).
- `yarn dev` starts Vite with HMR at the default port; use for day-to-day development.
- `yarn build` runs `tsc -b` then `vite build` to emit production assets into `dist/`.
- `yarn preview` serves the built app for a production-like check.
- `yarn lint` runs ESLint across the repo; fix findings before pushing.

## Coding Style & Naming Conventions
- TypeScript + JSX throughout; prefer function components with hooks.
- Indent with 2 spaces, single quotes, and no trailing semicolons (match existing files).
- Component files use `PascalCase` (e.g., `PuzzleGrid.tsx`); hooks use `useX` (e.g., `useTimer.ts`); utility modules are `camelCase`.
- Keep components focused; extract reusable UI into `src/components/` and shared helpers into `src/lib/`.
- Run `yarn lint` after structural changes; extend `eslint.config.js` instead of inline disabling rules.

## Testing Guidelines
- No test runner is configured yet; prefer Vitest + React Testing Library when adding tests.
- Co-locate tests as `*.test.ts`/`*.test.tsx` near the code or under `__tests__/`.
- Aim to cover hooks, reducers, and critical UI flows; add regression tests when fixing bugs.
- Document any new test commands in `package.json` scripts and this guide.

## Commit & Pull Request Guidelines
- Write imperative, concise commit messages (`Add puzzle grid interactions`, `Fix timer rollover`); group related changes per commit.
- Before opening a PR: run `yarn lint`, `yarn build`, and (once added) tests; attach screenshots/GIFs for UI changes.
- Reference related issues in PR descriptions; call out breaking changes and manual test steps.
- Keep diffs focused; avoid reformatting unrelated files, and prefer smaller, reviewable PRs.
