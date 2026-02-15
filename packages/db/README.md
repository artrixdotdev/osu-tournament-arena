# @ota/db

Database schema and ORM client using Drizzle ORM with Turso (LibSQL).

## Technologies

- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM with SQL-like syntax
- **[Turso/LibSQL](https://turso.tech/)** - Edge-ready SQLite database
- **[drizzle-zod](https://orm.drizzle.team/docs/zod)** - Generate Zod schemas from Drizzle schema

## Folder Structure

```
src/
├── schema/                 # Database schema definitions
│   ├── auth.ts             # Auth tables (user, session, account, etc.)
│   ├── tournaments/        # Tournament-related tables
│   └── index.ts            # Schema exports
├── client.ts               # Drizzle client instance
├── util.ts                 # Utility functions
└── index.ts                # Package exports
```

## Setup

### Option A: Local Development

1. Install the [Turso CLI](https://docs.turso.tech/cli/installation)
2. Push the schema:
   ```bash
   pnpm db:push
   ```
3. Start local database:
   ```bash
   pnpm --filter @ota/db dev
   ```

### Option B: Cloud Deployment

1. Create a database on [Turso](https://turso.tech/)
2. Add to your `.env`:
   ```env
   DATABASE_URL=libsql://your-database-url
   DATABASE_AUTH_TOKEN=your-auth-token
   ```
3. Push the schema:
   ```bash
   pnpm db:push
   ```

## Usage

### Querying Data

```ts
import { eq } from "@ota/db";
import { db } from "@ota/db/client";
import { user } from "@ota/db/schema";

const users = await db.select().from(user).where(eq(user.id, "123"));
```

### Schema Migrations

```bash
# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## Exports

| Export           | Description                               |
| ---------------- | ----------------------------------------- |
| `@ota/db`        | Drizzle SQL utilities (`eq`, `and`, etc.) |
| `@ota/db/client` | Drizzle client instance                   |
| `@ota/db/schema` | Database schema definitions               |
