# @ota/api

End-to-end typesafe API layer using oRPC.

## Technologies

- **[oRPC](https://orpc.unnoq.com/)** - TypeScript RPC framework for building typesafe APIs
- **[Zod](https://zod.dev/)** - Schema validation

## Folder Structure

```
src/
├── client.ts         # oRPC client factory for RPC calls
├── server.ts        # App router definition
├── orpc.ts          # Base oRPC configuration
├── middleware/      # oRPC middleware
│   ├── auth.ts     # Authentication middleware
│   └── staff.ts    # Staff authorization middleware
└── procedures/     # Procedure definitions
    ├── user.ts     # User procedures
    └── tournament.ts # Tournament procedures
```

## Route Visibility

Procedures with `.route()` metadata are exposed via both OpenAPI (`/api`) and RPC (`/rpc`). Procedures without route metadata are only accessible via RPC.

### Public Routes (OpenAPI + RPC)

| Procedure             | OpenAPI Path               |
| --------------------- | -------------------------- |
| `tournament.get`      | GET `/api/tournament/{id}` |
| `tournament.list`     | GET `/api/tournaments`     |
| `user.me`             | GET `/api/user/me`         |
| `user.updateTimezone` | PATCH `/api/user/timezone` |

### Protected Routes (RPC Only)

| Procedure                     | Required Role |
| ----------------------------- | ------------- |
| `tournament.create`           | HOST          |
| `tournament.updateDetails`    | ADMIN         |
| `tournament.updateSchedule`   | ADMIN         |
| `tournament.updateSettings`   | HOST          |
| `tournament.updateVisibility` | HOST          |
| `tournament.updateDiscord`    | ADMIN         |
| `tournament.archive`          | ADMIN         |
| `user.completeSignup`         | —             |
| `user.getSignupStatus`        | —             |

## Usage

### RPC Client (All Procedures)

```ts
import { orpc } from "@ota/api/client";

const client = orpc({
   baseUrl: "https://your-domain.com",
   provider: "web",
   env: "production",
});

// Public procedures
const tournament = await client.tournament.get({ id: "owc2026" });
const { tournaments, nextCursor } = await client.tournament.list({ limit: 10 });

// Protected procedures (require auth)
await client.tournament.create({ ... });
await client.tournament.updateDetails({ id: "owc2026", name: "New Name" });
```

### OpenAPI (Public Procedures Only)

```bash
# Get tournament by ID
curl https://your-domain.com/api/tournament/owc2026

# List public tournaments
curl "https://your-domain.com/api/tournaments?limit=10"

# Get current user
curl https://your-domain.com/api/user/me

# Update timezone
curl -X PATCH https://your-domain.com/api/user/timezone \
  -H "Content-Type: application/json" \
  -d '{"timezone": -5}'
```

## Middleware

### Authentication (`auth.ts`)

The `authorized` procedure requires a valid session. Adds `user` and `session` to context.

### Staff Authorization (`staff.ts`)

Role-based middleware for tournament-specific permissions:

- `requireHost(tournamentId)` - Requires HOST role
- `requireAdmin(tournamentId)` - Requires ADMIN role or higher
- `requirePooler(tournamentId)` - Requires POOLER role or higher
- `requirePlaytester(tournamentId)` - Requires PLAYTESTER role or higher
- `requireReferee(tournamentId)` - Requires REFEREE role or higher
- `requireCommentator(tournamentId)` - Requires COMMENTATOR role or higher

Staff middleware adds `staff` to context:

```ts
context.staff = {
   id: string;
   name: string;
   tournamentId: string;
   userId: string;
   roles: StaffRole[];
}
```

## Exports

| Export            | Description                    |
| ----------------- | ------------------------------ |
| `@ota/api/server` | App router definition          |
| `@ota/api/client` | Client-side API client factory |

## Adding New Procedures

1. Add procedures to `src/procedures/` (create new files as needed)
2. Add `.route()` metadata for procedures that should be exposed via OpenAPI
3. Import and add to `appRouter` in `server.ts`
