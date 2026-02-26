# @ota/web

Main SvelteKit web application for osu! Tournament Arena.

## Technologies

- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack web framework
- **[Svelte 5](https://svelte.dev/)** - UI framework with runes
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[oRPC](https://orpc.unnoq.com/)** - Typesafe API calls
- **[Cloudflare](https://developers.cloudflare.com/)** - Deployment via adapter-cloudflare

## Folder Structure

```
src/
├── lib/              # Shared utilities and helpers
├── routes/
│   ├── +page.svelte          # Home page
│   ├── +layout.svelte        # Root layout
│   ├── api/[...rest]/        # OpenAPI REST endpoint
│   └── rpc/[...rest]/        # oRPC RPC endpoint
└── static/           # Static assets
```

## Development

```bash
# From project root
bun run dev

# Or filter to web only
bun run dev:next
```

## Building

```bash
bun --filter @ota/web run build
```

## API Routes

### RPC Endpoint (`/rpc`)

The `/rpc/[...rest]` route handles all oRPC procedure calls using oRPC's proprietary RPC protocol. This endpoint has access to all procedures (both public and internal).

```typescript
// Client usage
import { orpc } from "@ota/api/client";

const client = orpc({});
const user = await client.user.me();
await client.user.updateTimezone({ timezone: -5 });
await client.user.completeSignup(); // Internal procedure - RPC only
```

### OpenAPI Endpoint (`/api`)

The `/api/[...rest]` route provides a RESTful OpenAPI-compliant API. Only procedures with explicit route metadata are exposed here.

| Method | Path                 | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/user/me`       | Get current user profile |
| PATCH  | `/api/user/timezone` | Update user timezone     |

All OpenAPI endpoints require authentication.

## Authentication

Uses `@ota/auth/client` for client-side auth:

```svelte
<script>
   import { authClient } from "@ota/auth/client";
</script>

<button onclick={() => authClient.signIn.social({ provider: "osu" })}>
   Sign in with osu!
</button>
```
