<script lang="ts">
   import { authClient } from "@ota/auth/client";
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
            await authClient.signIn.social({
               provider: "osu",
               callbackURL: "/signup",
            });
         }}
      >
         Sign In with osu!
      </Button>
   {/if}
</div>
