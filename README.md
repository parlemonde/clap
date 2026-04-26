# Clap!

A collaborative video creation platform for education. Teachers create themes and scenarios; students build storyboards and generate videos through a guided workflow.

## Tech Stack

- **Next.js 16** + **React 19**
- **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **better-auth**
- **AWS S3 / Lambda**

## Getting Started

Prerequisites: Node.js 22+ with pnpm and docker.

```bash
pnpm install
pnpm dev
pnpm db:migrate
```

The app runs at `http://localhost:3000`.

Other useful commands:

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript
pnpm db:studio   # Drizzle Studio
```

## Project Structure

```
src/
├── app/            # Next.js App Router pages and route handlers
├── frontend/       # Client components, hooks, contexts, and UI
├── server/         # Database, auth, AWS, emails, i18n
├── server-actions/ # Server actions invoked by the UI
└── lib/            # Shared utilities
```

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
