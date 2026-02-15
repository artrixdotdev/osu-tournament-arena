# @ota/auth

Authentication package using Better Auth with osu! and Discord OAuth providers.

## Technologies

- **[Better Auth](https://www.better-auth.com/)** - TypeScript authentication library
- OAuth providers: **osu!**, **Discord**

## Folder Structure

```
src/
├── index.ts     # Server-side auth configuration
└── client.ts    # Client-side auth client
```

## Setup

### Required Environment Variables

```env
AUTH_SECRET=your-secret-key
AUTH_OSU_CLIENT_ID=your-osu-client-id
AUTH_OSU_CLIENT_SECRET=your-osu-client-secret
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
```

### Creating OAuth Applications

1. **osu!**: Go to [osu! OAuth settings](https://osu.ppy.sh/home/account/edit#oauth)
2. **Discord**: Go to [Discord Developer Portal](https://discord.com/developers/applications)

Set the callback URL to: `https://your-domain.com/api/auth/callback/{provider}`

## Usage

### Server-side

```ts
import { auth } from "@ota/auth";

// In your API route
const session = await auth.api.getSession({ headers });
```

### Client-side

```ts
import { authClient } from "@ota/auth/client";

// Sign in with osu!
await authClient.signIn.social({ provider: "osu" });

// Sign in with Discord
await authClient.signIn.social({ provider: "discord" });

// Get current session
const session = authClient.useSession();
```

## Exports

| Export             | Description                                 |
| ------------------ | ------------------------------------------- |
| `@ota/auth`        | Server-side auth instance and configuration |
| `@ota/auth/client` | Client-side auth client for Svelte apps     |

## Account Linking Flow

1. Users must sign up with osu! first
2. Discord can be linked after initial osu! sign-up
3. OAuth IDs are stored on the user record (`osuId`, `discordId`)
