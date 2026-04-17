# @ota/validators

Shared Zod validation schemas and domain contracts for use across the frontend and backend.

## Technologies

- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

## Folder Structure

```
src/
├── dashboard.ts   # Dashboard response contracts and access helpers
├── tournament.ts  # Tournament input and content schemas
└── index.ts       # Package exports
```

## Usage

```ts
import { someSchema } from "@ota/validators";

// Use for validation
const result = someSchema.parse(data);

// Use with oRPC procedures
const procedure = base.handler((input) => someSchema.parse(input));
```

## When to Use

- API input validation that needs to be shared between client and server
- Form validation schemas used in multiple places
- Data transformation pipelines

## When NOT to Use

- Simple CRUD operations - use `drizzle-zod` schemas from `@ota/db/schema` instead
- Server-only validation - define inline with your procedure
