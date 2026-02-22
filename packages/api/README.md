# @ota/api

End-to-end typesafe API layer using oRPC.

## Technologies

- **[oRPC](https://orpc.unnoq.com/)** - TypeScript RPC framework for building typesafe APIs
- **[Zod](https://zod.dev/)** - Schema validation

## Folder Structure

```
src/
├── client.ts         # oRPC client factory for RPC calls
├── server.ts         # App router definition
├── orpc.ts           # Base oRPC configuration
├── middleware/       # oRPC middleware
│   └── auth.ts       # Authentication middleware
└── procedures/       # Procedure definitions
    └── user.ts       # User procedures
```

## Route Visibility

Procedures with `.route()` metadata are exposed via both OpenAPI (`/api`) and RPC (`/rpc`). Procedures without route metadata are only accessible via RPC.

| Procedure              | OpenAPI | RPC | OpenAPI Path               |
| ---------------------- | ------- | --- | -------------------------- |
| `user.me`              | ✓       | ✓   | GET `/api/user/me`         |
| `user.updateTimezone`  | ✓       | ✓   | PATCH `/api/user/timezone` |
| `user.completeSignup`  | ✗       | ✓   | —                          |
| `user.getSignupStatus` | ✗       | ✓   | —                          |

## Usage

### RPC Client (All Procedures)

```ts
import { orpc } from "@ota/api/client";

const client = orpc({
   baseUrl: "https://your-domain.com",
   provider: "web",
   env: "production",
});

// All procedures accessible
const user = await client.user.me();
await client.user.updateTimezone({ timezone: -5 });
await client.user.completeSignup(); // RPC only
```

### OpenAPI (Public Procedures Only)

```bash
# Get current user
curl https://your-domain.com/api/user/me

# Update timezone
curl -X PATCH https://your-domain.com/api/user/timezone \
  -H "Content-Type: application/json" \
  -d '{"timezone": -5}'
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
