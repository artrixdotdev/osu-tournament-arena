<script lang="ts">
   import { m } from "$i18n/messages";

   import { Button } from "@ota/ui/components/button/index.ts";

   let { onFinish, onBack } = $props<{
      onFinish: () => Promise<void>;
      onBack: () => void;
   }>();
</script>

<div class="space-y-2">
   <h2 class="text-xl font-semibold">
      {m.tournamentCreate_discord_title()}
   </h2>
   <p class="text-muted-foreground text-sm">
      {m.tournamentCreate_discord_description()}
   </p>
   <p class="text-muted-foreground text-sm">
      {m.tournamentCreate_discord_optional()}
   </p>
</div>

<div class="flex items-center justify-between">
   <Button variant="outline" onclick={onBack}>
      {m.tournamentCreate_back()}
   </Button>

   <div class="flex items-center gap-2">
      <Button variant="outline" onclick={onFinish}>
         {m.tournamentCreate_discord_skip()}
      </Button>
      <Button onclick={onFinish}>
         {m.tournamentCreate_finish()}
      </Button>
   </div>
</div>
