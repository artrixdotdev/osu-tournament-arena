# @ota/api

End-to-end typesafe API layer using oRPC.

## Technologies

- **[oRPC](https://orpc.unnoq.com/)** - TypeScript RPC framework for building typesafe APIs
- **[Zod](https://zod.dev/)** - Schema validation

## Folder Structure

```
src/
├── client.ts         # oRPC client factory for RPC calls
├── server.ts         # Router definitions (appRouter, apiRouter)
├── orpc.ts           # Base oRPC configuration
├── middleware/       # oRPC middleware
│   └── auth.ts       # Authentication middleware
└── procedures/       # Procedure definitions
    └── user.ts       # User procedures (public & internal)
```

## Route Types

### Public Procedures (OpenAPI + RPC)

Procedures with explicit route metadata are accessible via both the OpenAPI REST endpoint (`/api`) and the RPC endpoint (`/rpc`):

| Procedure             | Method | Path                 | RPC Call                                       |
| --------------------- | ------ | -------------------- | ---------------------------------------------- |
| `user.me`             | GET    | `/api/user/me`       | `client.user.me()`                             |
| `user.updateTimezone` | PATCH  | `/api/user/timezone` | `client.user.updateTimezone({ timezone: -5 })` |

### Internal Procedures (RPC Only)

Procedures without route metadata are only accessible via the RPC endpoint (`/rpc`):

| Procedure              | RPC Call                        |
| ---------------------- | ------------------------------- |
| `user.completeSignup`  | `client.user.completeSignup()`  |
| `user.getSignupStatus` | `client.user.getSignupStatus()` |

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
const user = await client.user.me();
await client.user.updateTimezone({ timezone: -5 });

// Internal procedures (RPC only)
await client.user.completeSignup();
const status = await client.user.getSignupStatus();
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

| Export            | Description                              |
| ----------------- | ---------------------------------------- |
| `@ota/api/server` | `appRouter` (full), `apiRouter` (public) |
| `@ota/api/client` | Client-side API client factory           |

## Adding New Procedures

1. Add procedures to `src/procedures/` (create new files as needed)
2. Mark public procedures with `.route()` metadata for OpenAPI access
3. Import and add to both `apiRouter` and `appRouter` in `server.ts`
4. Internal procedures only need to be added to `appRouter`
