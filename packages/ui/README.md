# @ota/ui

Shared UI component library built with shadcn-svelte and Tailwind CSS.

## Technologies

- **[shadcn-svelte](https://www.shadcn-svelte.com/)** - Re-usable components built with Radix UI and Tailwind
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Hugeicons](https://hugeicons.com/)** - Icon library (free tier with 4,600+ icons)
- **[tailwind-variants](https://www.tailwind-variants.com/)** - Component styling variants

## Folder Structure

```
src/
├── components/
│   └── ui/           # UI components (button, etc.)
├── icons/            # Icon components
├── styles/           # Shared styles
├── hooks/            # Svelte hooks
├── actions/          # Svelte actions
├── transitions/      # Transition animations
├── utils.ts          # Utility functions (cn, etc.)
└── index.ts          # Package exports
```

## Usage

```svelte
<script>
   import { Button } from "@ota/ui/components/button/index.ts";
</script>

<Button>Click me</Button>
```

## Adding Components

Run the shadcn-svelte CLI to add new components:

```bash
# From project root
pnpm ui-add

# Or specify component
pnpm ui-add button
```

## Exports

| Export                 | Description              |
| ---------------------- | ------------------------ |
| `@ota/ui`              | Main package exports     |
| `@ota/ui/components/*` | Individual UI components |
| `@ota/ui/icons/*`      | Icon components          |
| `@ota/ui/hooks/*`      | Svelte hooks             |
| `@ota/ui/styles/*`     | Shared styles            |
| `@ota/ui/utils.js`     | Utility functions        |
