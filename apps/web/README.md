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
│   └── api/rpc/[...rest]/    # oRPC API endpoint
└── static/           # Static assets
```

## Development

```bash
# From project root
pnpm dev

# Or filter to web only
pnpm dev:next
```

## Building

```bash
pnpm --filter @ota/web build
```

## API Routes

The `/api/rpc/[...rest]` route handles all oRPC procedure calls. Procedures are defined in `@ota/api/server`.

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
