# Clap!

A collaborative video creation platform for education. Teachers create themes and scenarios; students build storyboards and generate videos through a guided workflow.

## Tech Stack

- **Next.js 16** + **React 19**
- **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **better-auth**
- **AWS S3**

## Getting Started

Prerequisites: Node.js 22+ with pnpm.

```bash
pnpm install
pnpm dev
pnpm db:migrate # Optional, to do at first launch and when there are new migrations
```

The app runs at `http://localhost:3000`.

Other useful commands:

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript
pnpm db:studio   # Drizzle Studio
pnpm db:generate # Generate sql migrations
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

## Deployment

See [how-to-deploy.md](./how-to-deploy.md) for the full AWS deployment guide.

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
