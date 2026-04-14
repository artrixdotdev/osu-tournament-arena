---
name: shadcn-svelte-ui
description: Add or update shadcn components for this repo using shadcn-svelte in packages/ui. Use this when the user asks for shadcn components, primitives, or CLI-generated UI in this codebase. Always work from packages/ui and replace any generated lucide icons with Hugeicons equivalents.
---

# Shadcn Svelte UI

Use this skill when the user wants a shadcn component added, updated, or scaffolded in this repository.

## Repo rules

- This repo uses `shadcn-svelte`, not React shadcn and not `lucide-react`.
- Run shadcn commands from `packages/ui`, not from `apps/web`.
- Treat `packages/ui/components.json` as the source of truth for aliases and generation paths.
- New shared UI components belong under `packages/ui/src/components/ui`.
- If an app needs the component, add it to `packages/ui` first and consume it from there.

## Workflow

1. Change into `packages/ui`.
2. Add the component with the local package script first:
   ```bash
   bun run ui:add <component>
   ```
   If needed, fall back to:
   ```bash
   bunx shadcn-svelte@latest add <component>
   ```
3. Review every generated or modified file before finishing. Shadcn output is a starting point, not the final result.
4. Replace any icon usage from `lucide-svelte`, `lucide-react`, or other shadcn defaults with Hugeicons.
5. Keep imports and aliases aligned with existing `@ota/ui` package patterns.
6. Run package-level validation after edits.

## Icon policy

This repo standardizes on Hugeicons for Svelte:

```svelte
<script lang="ts">
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
</script>

<HugeiconsIcon icon={ArrowDown01Icon} class="size-4" />
```

- Remove all generated Lucide imports.
- Pick the closest Hugeicons semantic match for each icon.
- If the mapping is not obvious, prefer preserving intent over matching the original name exactly.
- Keep icon sizing and utility classes consistent with nearby components in `packages/ui/src/components/ui`.

## Validation

Run the relevant checks from `packages/ui` after generation and cleanup:

```bash
bun run check-types
```

Use `bun run lint` too when the generated output touched multiple files or imports.

## Notes

- Match the existing style in nearby components before accepting generated code.
- Shadcn may generate acceptable structure but still needs repo-specific cleanup.
- Do not leave behind dead imports, mismatched aliases, or app-local copies of shared UI.
