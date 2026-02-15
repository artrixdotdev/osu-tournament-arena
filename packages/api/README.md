# @ota/api

End-to-end typesafe API layer using oRPC.

## Technologies

- **[oRPC](https://orpc.unnoq.com/)** - TypeScript RPC framework for building typesafe APIs
- **[Zod](https://zod.dev/)** - Schema validation

## Folder Structure

```
src/
├── client/           # Client-side API client
│   └── index.ts      # oRPC client factory
├── server/           # Server-side router
│   └── index.ts      # App router definition
├── middleware/       # oRPC middleware
│   └── auth.ts       # Authentication middleware
└── orpc.ts           # Base oRPC configuration
```

## Usage

```ts
import { orpc } from "@ota/api/client";

const client = orpc({
   baseUrl: "https://your-domain.com",
   provider: "web",
   env: "production",
});

// Fully typed!
const result = await client.user.me();
```

## Exports

| Export            | Description                     |
| ----------------- | ------------------------------- |
| `@ota/api/server` | Server-side router and handlers |
| `@ota/api/client` | Client-side API client factory  |

## Adding New Procedures

1. Define your procedure in the router at `src/server/index.ts`
2. Add any required middleware in `src/middleware/`
3. The client automatically receives types for new procedures
