<script lang="ts">
   import * as Avatar from "@ota/ui/components/avatar/index.ts";

   let {
      items,
      max = 18,
      kind = "image",
   }: {
      items: {
         id: number;
         name: string;
         image?: string | null;
      }[];
      max?: number;
      kind?: "image" | "initials";
   } = $props();

   const visibleItems = $derived(items.slice(0, max));
   const overflowCount = $derived(Math.max(0, items.length - max));

   function initials(name: string) {
      return name
         .split(/\s+/)
         .filter(Boolean)
         .slice(0, 2)
         .map((part) => part[0]?.toUpperCase() ?? "")
         .join("");
   }
</script>

<div class="flex flex-wrap items-center gap-0">
   {#each visibleItems as item, index (item.id)}
      <Avatar.Root
         class={`border-background bg-muted size-10 border-2 ${index === 0 ? "" : "-ml-2"}`}
         title={item.name}
         aria-label={item.name}
      >
         {#if kind === "image"}
            <Avatar.Image src={item.image ?? undefined} alt={item.name} />
         {/if}
         <Avatar.Fallback>{initials(item.name)}</Avatar.Fallback>
      </Avatar.Root>
   {/each}

   {#if overflowCount > 0}
      <div
         class="bg-muted text-muted-foreground border-background -ml-2 flex size-10 items-center justify-center rounded-full border-2 text-sm font-medium"
         title={`+${overflowCount}`}
         aria-label={`+${overflowCount}`}
      >
         +{overflowCount}
      </div>
   {/if}
</div>
