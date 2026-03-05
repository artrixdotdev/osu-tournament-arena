# @ota/env

Type-safe environment variable validation using T3 Env.

## Technologies

- **[@t3-oss/env](https://github.com/t3-oss/t3-env)** - Type-safe environment variable validation
- **[Zod](https://zod.dev/)** - Schema validation

## Folder Structure

```
src/
├── index.ts     # Combined env exports
├── auth.ts      # Auth-related env vars
├── db.ts        # Database-related env vars
├── discord.ts   # Discord-related env vars
└── storage.ts   # S3 storage-related env vars
```

## Usage

### Auth Environment

```ts
import { authEnv } from "@ota/env";

const env = authEnv();
// env.AUTH_OSU_CLIENT_ID
// env.AUTH_OSU_CLIENT_SECRET
// env.AUTH_DISCORD_ID
// env.AUTH_DISCORD_SECRET
// env.AUTH_SECRET
```

### Database Environment

```ts
import { dbEnv } from "@ota/env";

const env = dbEnv();
// env.DATABASE_URL
// env.DATABASE_AUTH_TOKEN
```

### Storage Environment

```ts
import { storageEnv } from "@ota/env";

const env = storageEnv();
// env.STORAGE_S3_ENDPOINT
// env.STORAGE_S3_REGION
// env.STORAGE_S3_ACCESS_KEY_ID
// env.STORAGE_S3_SECRET_ACCESS_KEY
// env.STORAGE_S3_FORCE_PATH_STYLE
// env.STORAGE_S3_BUCKET_REPLAYS
// env.STORAGE_S3_BUCKET_TOURNAMENT_MEDIA
// env.STORAGE_S3_PUBLIC_URL
```

`storageEnv()` also accepts `S3_*` aliases (`S3_ENDPOINT`, `S3_REGION`, etc.) for compatibility with `scripts/bootstrap-storage.ts`.

## Why Separate Env Functions?

Different parts of the app need different environment variables:

- The database package doesn't need auth secrets
- The auth package doesn't need database tokens
- This prevents leaking unnecessary env vars to each context

## Adding New Environment Variables

1. Add the variable to the appropriate file (`auth.ts`, `db.ts`, or create new)
2. Define a Zod schema for validation
3. Export from `index.ts`
