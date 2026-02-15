# osu! Tournament Arena

A web application for managing osu! tournaments, built with a modern TypeScript monorepo architecture.

## Project Overview

osu! Tournament Arena is a tournament management platform designed for osu! players and tournament organizers. It provides tools for tournament creation, registration, bracket management, mappool creation, and more.

## Tech Stack

### Core Technologies

- **[SvelteKit](https://kit.svelte.dev/)** - Web framework
- **[oRPC](https://orpc.unnoq.com/)** - End-to-end typesafe API layer
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM
- **[Better Auth](https://www.better-auth.com/)** - Authentication
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[Turborepo](https://turborepo.com/)** - Monorepo build system

### Database

- **[Turso/LibSQL](https://turso.tech/)** - Edge-ready SQLite database

## Project Structure

```
├── apps/
│   └── web/                    # SvelteKit web application
├── packages/
│   ├── api/                    # oRPC router & client
│   ├── auth/                    # Better Auth configuration
│   ├── db/                      # Drizzle ORM schema & client
│   ├── env/                     # Environment variable validation
│   ├── ui/                      # Shared UI components (shadcn-svelte)
│   └── validators/              # Shared Zod schemas
└── tooling/
    ├── eslint/                  # Shared ESLint config
    ├── prettier/                # Shared Prettier config
    ├── svelte/                  # Shared SvelteKit config
    ├── tailwind/                # Shared Tailwind config
    └── typescript/              # Shared TypeScript config
```

## Packages

| Package                                    | Description                                     |
| ------------------------------------------ | ----------------------------------------------- |
| [`@ota/api`](./packages/api)               | oRPC router definition and typesafe client      |
| [`@ota/auth`](./packages/auth)             | Authentication with osu! and Discord OAuth      |
| [`@ota/db`](./packages/db)                 | Database schema and Drizzle ORM client          |
| [`@ota/env`](./packages/env)               | Type-safe environment variable validation       |
| [`@ota/ui`](./packages/ui)                 | Reusable UI components built with shadcn-svelte |
| [`@ota/validators`](./packages/validators) | Shared Zod validation schemas                   |

## Apps

| App                      | Description                    |
| ------------------------ | ------------------------------ |
| [`@ota/web`](./apps/web) | Main SvelteKit web application |

## Quick Start

### Prerequisites

- Node.js `^25.2.1`
- pnpm `^10.28.0`

### Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Configure your OAuth providers (osu!, Discord) in the `.env` file
4. Push the database schema:
   ```bash
   pnpm db:push
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Useful Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start development server        |
| `pnpm build`     | Build all packages and apps     |
| `pnpm lint`      | Run ESLint across the monorepo  |
| `pnpm format`    | Check code formatting           |
| `pnpm typecheck` | Run TypeScript type checking    |
| `pnpm db:push`   | Push Drizzle schema to database |
| `pnpm db:studio` | Open Drizzle Studio             |
| `pnpm ui-add`    | Add shadcn-svelte components    |

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm typecheck` before committing
4. Open a pull request

## License

MIT
