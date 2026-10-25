# Artist Manager

A gallery-style workspace for artists to find real grants, residencies and fellowships, understand requirements, prepare applications, and track their practice.

## Run locally

Use Node.js 22.12+ (Node 24 recommended), then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. `npm run build` typechecks and produces `dist/`; `npm test` runs focused domain tests. `npm run preview` serves a production build.

## Included

- 24 real opportunities with provider links, dated source review, fees and deadline caveats; no fictional listings.
- Profile-based requirement percentages, explicit missing facts and provisional eligibility, highest-match-first discovery.
- Search, type/discipline/window/eligibility/amount filters, saved opportunities, and alternate sorting.
- Editable artist profile, project facts, bio, statement and up to eight compressed work-sample thumbnails.
- One application workspace per opportunity with editable drafts, checklist, selected samples and notes.
- Board and deadline-sorted list; keyboard-accessible status menus and supplemental drag/drop.
- Versioned browser storage; failed writes remain visible and corrupt saved data is not silently overwritten.
- Static-host-safe hash routes and relative assets for GitHub Pages.

## Scope and data

Portfolio and application information is saved in localStorage on the current browser. If you request an AI draft, the selected text and sample metadata are sent to your configured backend and OpenAI after your approval. There are no accounts or cross-device synchronization. Clearing browser data removes local work. Original work-sample files are not stored; only bounded thumbnails are retained. Third-party fonts and a hero video are loaded externally.

The catalog reflects source review on **2026-10-24**, not continuous live verification. Deadline logic uses exact source times where established and provider local calendar dates otherwise; unspecified cutoff times remain uncertain. Opening months are not converted into exact dates. Availability and eligibility are separate.

Requirement match = rounded percentage of distinct reviewed applicable rules met. Unknown facts stay in the denominator with no points. Not all funder rules have been normalized; such percentages are provisional and never certify complete eligibility or predict awards. Known mandatory failures rank last. Amount sorting uses only established advertised cash amounts; historical/unconfirmed and in-kind awards have no fabricated value.

The workspace includes a professional AI grant writer with a requirement plan, proposed answer, evidence-linked coverage and follow-up questions. Its Node backend is implemented and needs deployment plus a server-side OpenAI key before live drafting works. See [backend setup](docs/ai-backend-setup.md). Local portfolio text assembly remains available. No application is submitted to a funder through this app.

## Validation

`npm test` covers independent match arithmetic, missing facts, mandatory failures/ranking, deduplication, source-date boundaries and saved-data preservation/rejection. Kane browser journey verification has not yet run; it remains pending the required review checkpoints. See project notes for future run evidence. Do not infer browser coverage from unit tests.

## Hosting

The lead configures GitHub Pages through `.github/workflows/`. Hash routes support page refresh on a static host. Only the production `dist/` artifact should be served; private browser data is never included in the build.

Live site: https://isledeli.github.io/artist-manager/
Repository: https://github.com/isleDeli/artist-manager

## Demo with Taylor Smalls

Open Portfolio and select **Load Taylor’s demo portfolio**. This loads a public-source bio/practice summary and three credited artworks into the app’s normal profile, matching and application flows. Unknown private eligibility facts stay blank. Demo changes persist in a separate browser workspace; **Return to my workspace** restores your personal profile and drafts. This is demonstration data, not Taylor’s own account or actual applications. See docs/demo-profile.md for sources.

## AI backend

[Deploy to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FisleDeli%2Fartist-manager) · [Setup instructions](docs/ai-backend-setup.md)

Set OPENAI_API_KEY and a separate GRANT_WRITER_ACCESS_CODE only in Render’s environment settings. Keep both private. The GitHub Pages frontend accepts the backend URL at runtime, so connecting a deployed backend does not require rebuilding the website.

Temporary demo update: the artist-facing backend/access-code setup fields have been removed. The owner must manually deploy the latest commit on Render. See docs/ai-backend-setup.md for the current steps and usage limits; older access-code instructions above describe the previous flow.
