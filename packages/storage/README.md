# @ota/storage

S3-compatible storage layer for tournament assets.

## Buckets

The package uses these logical buckets:

- `replays`
- `tournamentMedia`

Default physical bucket names (created by `storage:init`):

- `replays`
- `tournament-media`

## Setup (Local Garage)

Local storage is bootstrapped from the repository root:

```bash
bun run storage:init
```

This runs [`scripts/bootstrap-storage.ts`](../../scripts/bootstrap-storage.ts), which:

1. Creates `packages/storage/.garage` directories and config
2. Starts Garage
3. Configures single-node layout
4. Creates buckets `replays` and `tournament-media`
5. Creates S3 key `app-key` and grants permissions
6. Publishes `tournament-media` through Garage's website endpoint
7. Writes env vars into `.env`

To keep Garage running manually after bootstrap:

```bash
bun --cwd packages/storage run dev
```

## Environment Variables

`@ota/storage` accepts either naming scheme:

- `STORAGE_S3_*` (package-native)
- `S3_*` (bootstrap script output)

Primary variables:

```env
S3_ENDPOINT=http://127.0.0.1:7279
S3_REGION=garage
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_TOURNAMENT_MEDIA=tournament-media
S3_BUCKET_REPLAYS=replays
```

Optional:

```env
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=
```

## Usage

```ts
import { createS3Storage } from "@ota/storage";

const storage = createS3Storage();

await storage.putObject("replays", {
   key: "tournament-42/round-2/player-15.osr",
   body: replayBuffer,
});

await storage.putObject("tournamentMedia", {
   key: "tournament-42/banner.png",
   body: imageBuffer,
   contentType: "image/png",
});
```

## Notes

- `tournamentMedia` is the TypeScript bucket key.
- `tournament-media` is the actual S3 bucket name.
- If you re-run bootstrap often, it will reconcile `.env` values automatically.
