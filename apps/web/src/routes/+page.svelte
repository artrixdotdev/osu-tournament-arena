<script lang="ts">
   import { goto } from "$app/navigation";

   import { Button } from "@ota/ui/components/button/index.ts";

   let { data } = $props();
</script>

<div class="flex size-full items-center justify-center">
   {#if data.user}
      <div class="text-center">
         <h1 class="text-2xl font-bold">Welcome, {data.user.name}!</h1>
         <p class="text-muted-foreground mt-2">You're all set up.</p>
      </div>
   {:else}
      <Button
         onclick={async () => {
            await goto("/signup");
         }}
      >
         Create an account
      </Button>
   {/if}
</div>
