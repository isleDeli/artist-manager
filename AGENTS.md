# Repository Guidelines

## Current Repository State

Artist Manager is being implemented as a React 18/TypeScript/Vite frontend with Tailwind CSS 3, a curated real-opportunity catalog and localStorage persistence. Read requirements.md and STATE.md for current scope. Source lives in src/ and domain tests in tests/.

## Project Structure & Module Organization

Keep application code in `src/`, automated tests in `tests/`, and static resources in `assets/` or the framework-standard public directory. Put supporting documentation in `docs/` and reusable development scripts in `scripts/`. Create directories only when they contain relevant files. Keep dependency manifests and tool configuration at the repository root.

## Build, Test, and Development Commands

No build, test, or development commands are currently configured. When selecting a stack, add reproducible commands and document them in `README.md`. For a Node.js project, prefer consistent scripts such as `npm run dev`, `npm run build`, `npm test`, and `npm run lint` once implemented. Commit the chosen package manager’s lockfile and avoid mixing package managers.

## Coding Style & Naming Conventions

Follow the selected language’s standard conventions and use an automated formatter and linter when available. Until tooling defines otherwise, use two spaces for JavaScript, TypeScript, JSON, and YAML, and four spaces for Python. Use descriptive names, keep modules focused, and follow the framework’s file naming conventions. Avoid introducing competing formatting tools.

## Testing Guidelines

No testing framework or coverage threshold is established. Select a framework appropriate to the application and document its invocation. Name tests consistently, for example `feature.test.ts` or `test_feature.py`. Cover important behavior, failure paths, and bug regressions. Before opening a pull request, run all configured checks and report any checks that could not run.

## Commit & Pull Request Guidelines

There is no Git history from which to infer commit conventions. Use concise, imperative commit subjects, such as `Add project scaffold`. Keep commits focused. Pull requests should explain the problem, changes, and validation performed; link relevant issues and include screenshots for visible UI changes.

## Security & Configuration

Never commit credentials, access tokens, or local environment files. Provide an `.env.example` containing placeholder values when configuration becomes necessary, and ignore generated files and local secrets.
