<script lang="ts">
   import { goto } from "$app/navigation";
   import { Search01Icon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$paraglide/messages.js";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as InputGroup from "@ota/ui/components/input-group/index.ts";
   import { Label } from "@ota/ui/components/label/index.ts";

   let { data } = $props();
</script>

<div
   class="mx-auto flex size-full max-w-md flex-col items-center justify-center gap-4"
>
   {#if data.user}
      <div class="text-center">
         <h1 class="text-2xl font-bold">
            {m.home_welcome({ name: data.user.name })}
         </h1>
         <p class="text-muted-foreground mt-2">{m.home_allSet()}</p>
      </div>

      <InputGroup.Root inputmode="search">
         <InputGroup.Addon align="block-start">
            <Label for="search" class="text-foreground">
               {m.home_searchTournaments()}
            </Label>
            <InputGroup.Button
               variant="default"
               class="ms-auto"
               onclick={async () => await goto("/search")}
            >
               {m.home_advancedSearch()}
            </InputGroup.Button>
         </InputGroup.Addon>
         <InputGroup.Addon class="w-full">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} />
            <InputGroup.Input
               placeholder={m.home_searchPlaceholder()}
               name="search"
               id="search"
            />
         </InputGroup.Addon>
      </InputGroup.Root>
   {:else}
      <Button onclick={async () => await goto("/signup")}>
         {m.home_createAccount()}
      </Button>
   {/if}
</div>
