<script lang="ts">
   import { authClient } from "@ota/auth/client";
   import { Button } from "@ota/ui/components/button/index.ts";
</script>

<div class="size-full">
   <Button
      class="m-auto"
      onclick={async () => {
         await authClient.signIn.social({
            provider: "osu",
         });
      }}
   >
      Sign In
   </Button>
</div>
