# AGENTS.md

## Purpose

This file is the working guide for coding agents in the `clap` repository.
It is intentionally focused on the live application code under `src/`.

Do not spend time on the separate `server-*` folders when working from this guide:

- `server-video-generation/`
- `server-pdf-generation/`
- `server-websockets/`

Those folders exist today, but they are out of scope here and are expected to be removed. If a task mentions "the app", "the frontend", "the Next.js codebase", or "the main product", treat that as the `src/` application unless the user explicitly says otherwise.

## What This Repo Is

Clap is a Next.js 15 + React 19 application for guided, collaborative video creation in education.

The app supports:

- Teacher/admin management of themes, scenarios, questions, languages, and users
- Student participation through invitation/join flows
- A 6-step video creation flow
- Real-time collaboration on project/storyboard content
- PDF and video generation initiated from the main app
- Internationalized UI, with French as the default language

## Scope To Read First

When starting a task, prioritize these files and folders:

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `src/app/`
- `src/frontend/`
- `src/server/`
- `src/server-actions/`
- `src/lib/`
- `src/i18n/`

Ignore:

- `server-*/`
- generated build output such as `.next/`
- `public/` unless the task is asset-specific

## Runtime And Tooling

- Package manager: `pnpm`
- Node version: Volta-pinned to `22.15.1`
- Framework: Next.js App Router
- Language: TypeScript with `strict: true`
- Lint: ESLint flat config in `eslint.config.mjs`
- Formatting: Prettier via ESLint
- Database: PostgreSQL via Drizzle ORM
- Auth: `better-auth`
- Storage: local files in development or S3 in deployed environments
- Auxiliary infra used by app code: DynamoDB, Lambda, WebSocket collaboration server

Useful commands:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm db:migrate
pnpm db:generate
pnpm db:studio
```

There is no obvious app test suite configured in the root package today. For validation, default to `pnpm lint` and `pnpm typecheck` unless a task requires more.

## High-Level Architecture

The live app is split into a few clear layers:

- `src/app/`: Next.js App Router pages, layouts, route handlers, and page-local client components
- `src/frontend/`: reusable client-facing UI, hooks, contexts, navigation, collaboration widgets, upload helpers, and styling
- `src/server/`: database, auth, AWS/storage, and server-only helpers/services
- `src/server-actions/`: server actions and server-side use cases invoked by pages/components
- `src/lib/`: cross-cutting utilities and helpers shared across layers, but kept dependency-light
- `src/i18n/`: translation helpers and locale primitives
- `src/emails/`: email sending and templates

The architectural center of gravity is:

1. App Router pages render data and compose flows
2. Client components read/update local UI state and call server actions or API routes
3. Server actions enforce auth/authorization and perform writes
4. `src/server` owns database/auth/storage/infrastructure integration

## Import And Dependency Rules

Take the ESLint import-boundary rules seriously. They describe the intended architecture.

Path aliases:

- `@app/*` -> `src/app/*`
- `@frontend/*` -> `src/frontend/*`
- `@lib/*` -> `src/lib/*`
- `@server/*` -> `src/server/*`
- `@server-actions/*` -> `src/server-actions/*`

Rules enforced by ESLint:

- Use aliases for cross-module imports instead of long relative paths
- `src/frontend` may import runtime values from frontend/lib modules, but may only import types from `@app/*` and `@server/*`
- `src/server` may only import types from `@app/*`, `@frontend/*`, and `@server-actions/*`
- `src/server-actions` may only import types from `@app/*` and `@frontend/*`
- `src/lib` may only import types from app/frontend/server/server-actions modules

Practical guidance:

- If code belongs to the browser UI, keep it in `src/frontend` or a page-local client component
- If code touches DB/auth/storage/AWS/headers/cookies, keep it in `src/server` or `src/server-actions`
- Do not move server-only logic into `src/frontend` just because a component needs it
- Prefer adding a server action or route handler instead

## Main App Surface

### Routing

Important route groups in `src/app/`:

- `/`:
  home page, theme selection, teacher landing page
- `/login`, `/sign-up`, `/reset-password`, `/update-password`, `/join`:
  authentication and invitation/join flows
- `/my-account`:
  self-service account management
- `/my-videos` and `/my-videos/[id]`:
  project listing and project management
- `/create/*`:
  the core guided creation workflow
- `/admin/*`:
  admin CRUD surfaces for users, themes, scenarios, questions, and languages
- `/api/*`:
  route handlers for uploads, data fetches, auth integration, locales, and project collaboration helpers
- `/media/*`:
  file-serving routes

### Creation Workflow

The core product flow lives under `src/app/create/`:

1. `1-scenario`
2. `2-questions`
3. `3-storyboard`
4. `4-pre-mounting`
5. `5-music`
6. `6-result`

There are also helper routes for:

- creating a new scenario/theme from within the flow
- editing title/plan content
- generating storyboard PDF output

When modifying this flow, preserve the step order, route naming, and the expectation that a selected/current project is often tracked in local storage.

## Key State And Data Model

The most important domain record is `projects`, defined in `src/server/database/schemas/projects.ts`.

Notable fields:

- relational metadata: `id`, `userId`, `themeId`, `scenarioId`
- display metadata: `name`, `language`
- collaboration metadata:
  `collaborationCode`, `collaborationCodeExpiresAt`
- generation metadata:
  `videoJobId`
- structured content payload:
  `data`

`projects.data` is central to the product. It contains:

- selected theme and scenario
- ordered `questions`
- per-question `plans`
- optional `title`
- optional voice/audio data
- project-level sound configuration

Important nested types:

- `ProjectData`
- `Sequence`
- `Plan`
- `Title`

If you change project editing behavior, check whether the update belongs in the structured `data` payload versus a top-level DB column.

## Authentication And Authorization

Auth lives in `src/server/auth/`.

Important entry points:

- `src/server/auth/auth.ts`
- `src/server/auth/get-current-user.ts`

Patterns to preserve:

- Call `getCurrentUser()` in server actions, route handlers, and server components that need access control
- `better-auth` is configured with roles: `admin`, `teacher`, `student`
- Student access is narrower and often restricted to `user.projectId`
- Some pages redirect students away from teacher-only flows

When adding writes, enforce authorization in the server action or route handler, not only in the client.

## Data Access

Database code lives in:

- `src/server/database/database.ts`
- `src/server/database/schemas/*.ts`

Patterns:

- Use the shared `db` instance
- Prefer Drizzle query helpers and typed schema access
- Existing code often soft-filters by user ownership or role at query time
- `registerService()` is used to cache server-side service instances in development

If a feature needs a new persisted field, update the Drizzle schema first and then follow the existing migration workflow.

## Server Actions

`src/server-actions/` is the main mutation/query layer used by the app.

Current domains include:

- authentication
- files
- languages
- projects
- questions
- scenarios
- themes
- users
- translations/locales

Typical pattern:

1. add `'use server'`
2. fetch current user
3. authorize
4. read/write through `db` or server services
5. optionally `revalidatePath()` for affected pages

Use server actions for app-internal operations before reaching for a new API route, unless the caller specifically needs HTTP upload/streaming behavior or a public endpoint shape.

## API Routes

Keep route handlers in `src/app/api/` for cases where the browser needs HTTP semantics:

- multipart uploads like `/api/images`
- upload helpers for audio/images
- JSON fetch endpoints used by SWR
- auth callback/integration endpoints
- locale conversion/fetch endpoints

Examples:

- `/api/images` converts uploads to WebP with `sharp`
- `/api/projects/[id]` is used by client-side SWR project refreshes
- `/api/projects/[id]/get-collaboration-url` supports collaboration setup

If a feature is purely invoked from React code inside this app, prefer a server action unless you specifically need `Request`/`Response`, file upload, or streaming.

## Frontend Structure

`src/frontend/` contains the reusable UI system and most client helpers.

Major areas:

- `components/layout/`: primitives like buttons, form controls, modal, typography, container, flex, loader
- `components/navigation/`: top/bottom nav, breadcrumbs, steps
- `components/create/`: storyboard/creation-flow-specific UI
- `components/collaboration/`: collaboration status, feedback, alerts
- `components/admin/`: admin-facing building blocks
- `contexts/`: user and translation contexts
- `hooks/`: local storage, current project, collaboration, websockets, debouncing
- `lib/`: client-side helpers like uploads, colors, auth client, tabs
- `fonts/`, `svg/`: static UI assets

Conventions:

- Many page-level files are server components by default
- Files marked `'use client'` contain interactivity
- CSS is mostly handled with CSS modules plus global styles in `src/app/globals.css`
- Existing UI style is custom and not based on Tailwind

## Collaboration Model

Real-time collaboration is part of the main app behavior even though the standalone websocket server folder is out of scope.

App-side collaboration logic lives in:

- `src/frontend/hooks/useCollaboration.tsx`
- `src/frontend/hooks/useWebsockets.ts`
- `src/frontend/components/collaboration/*`
- `src/server-actions/projects/start-collaboration.ts`
- `src/server-actions/projects/end-collaboration.ts`

Behavior to preserve:

- current project is read client-side
- collaboration URL is fetched through app APIs
- websocket messages trigger project refreshes and validation alerts
- students and teachers have different editing/validation responsibilities

Do not remove or break collaboration hooks inside the app just because `server-websockets/` is out of scope for this guide.

## Media And Generation

The app initiates media generation from inside `src/server-actions/projects/`.

Important files:

- `generate-video.ts`
- `generate-pdf/`
- `generate-mlt-zip.ts`
- `project-to-mlt.ts`

The main app responsibilities here are:

- building generation payloads from `ProjectData`
- checking progress
- invoking Lambda-backed jobs
- exposing downloadable URLs

Even if the backing workers live elsewhere, the app-side orchestration is in scope.

## Internationalization

Translation-related code is spread across:

- `src/i18n/*`
- `src/server-actions/get-locales.ts`
- `src/frontend/contexts/translationContext.tsx`
- `src/frontend/components/ui/Trans.tsx`
- locale API routes under `src/app/api/locales/[languageCode]/`

Patterns:

- default locale is French unless a cookie overrides it
- translations are resolved through the app translation helpers, not a heavy external i18n runtime
- locale payloads can be cached/fetched through DynamoDB

When editing user-visible text, check whether the string should be translated rather than hard-coded.

## File Uploads And Media Serving

Key files:

- `src/app/api/images/route.ts`
- `src/app/api/audios/route.ts`
- `src/server/file-upload/*`
- `src/app/media/*`

Behavior:

- images are normalized to WebP with `sharp`
- storage backend switches between local filesystem and S3
- media URLs are generally app-relative like `/<path>`

If you add a new upload or serving path, keep authorization and storage abstraction in the server layer.

## Conventions That Matter

### Code style

- Prefer TypeScript types from existing schema/domain files
- Use `import type` where appropriate
- Keep `camelCase` unless the file already uses schema-driven snake_case names
- Avoid `console.log`; lint only allows `console.warn` and `console.error`
- Keep import ordering clean because ESLint enforces it

### Component choices

- Default to server components in `src/app`
- Add `'use client'` only when hooks, browser APIs, event handlers, or mutable UI state are needed
- Reuse existing layout/form/navigation primitives before creating new ones

### Data flow

- Reads for server-rendered pages: server components or server actions
- Client refresh/state sync: SWR plus small route handlers where already established
- Writes: server actions first
- Browser-only persistence: local storage hooks already exist and are used in the creation flow

### Revalidation

- If a server action changes content shown on statically cached or previously rendered routes, consider `revalidatePath()`
- Follow existing patterns rather than adding global invalidation

## Safe Change Patterns

When adding a feature:

1. decide whether it belongs in `app`, `frontend`, `server-actions`, `server`, or `lib`
2. preserve the import-boundary rules
3. enforce auth server-side
4. reuse existing form/layout/navigation primitives
5. update translations if user-facing copy changes
6. validate with `pnpm lint` and `pnpm typecheck`

When changing project/storyboard behavior:

1. inspect `projects.ts` schema types first
2. inspect `useCurrentProject`, `useLocalStorage`, and relevant create-step pages
3. check whether collaboration messages/status need to stay in sync
4. check whether result generation depends on the changed data shape

When changing admin CRUD:

1. inspect the matching `src/server-actions/<domain>/`
2. inspect the `src/app/admin/<domain>/` pages/forms/tables
3. preserve role checks and ownership assumptions

## File Placement Guide

Use this when deciding where new code should go:

- new page or route segment:
  `src/app/...`
- reusable presentational or interactive UI:
  `src/frontend/components/...`
- page-specific client form tied to one route:
  colocate under that `src/app/...` route folder
- reusable browser hook:
  `src/frontend/hooks/...`
- server-only integration or service:
  `src/server/...`
- server mutation/query use case:
  `src/server-actions/...`
- pure utility with minimal dependencies:
  `src/lib/...`
- schema or persisted type:
  `src/server/database/schemas/...`

## Known Realities Of This Codebase

- The `README.md` project-structure section is outdated relative to the current `src/frontend`, `src/server`, and `src/server-actions` layout
- Some files still import from `src/...` directly instead of aliases; do not expand that pattern
- `.DS_Store` files exist in a few places; they are not meaningful application code
- The root ESLint config already ignores the `server-*` directories

## Suggested First Read For Most Tasks

If a future agent needs quick orientation, this sequence is usually enough:

1. `package.json`
2. `tsconfig.json`
3. `eslint.config.mjs`
4. `src/app/layout.tsx`
5. the route or feature folder being changed
6. the corresponding `src/server-actions/...` files
7. any relevant schema in `src/server/database/schemas/...`

## Default Assumptions For Future Agents

Unless the user says otherwise:

- work only in the main Next.js app
- ignore `server-*` directories
- preserve current route structure
- preserve current project JSON shape unless the task explicitly requires schema changes
- prefer server actions over new API routes for internal mutations
- run `pnpm lint` and `pnpm typecheck` after meaningful code changes
