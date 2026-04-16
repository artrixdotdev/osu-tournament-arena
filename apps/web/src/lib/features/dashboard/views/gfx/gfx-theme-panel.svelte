<script lang="ts">
   import type { DashboardThemeState } from "$lib/features/dashboard/types";
   import { m } from "$i18n/messages";
   import TournamentThemeFields from "$lib/components/tournament-theme-fields.svelte";
   import { TOURNAMENT_FONT_OPTIONS } from "$lib/tournament-page";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";

   let {
      fontFamily = $bindable(""),
      radius = $bindable(""),
      themeMode = $bindable<"light" | "dark">("light"),
      lightTheme = $bindable<DashboardThemeState>({}),
      darkTheme = $bindable<DashboardThemeState>({}),
   }: {
      fontFamily: string;
      radius: string;
      themeMode: "light" | "dark";
      lightTheme: DashboardThemeState;
      darkTheme: DashboardThemeState;
   } = $props();
</script>

<Card as="article" variant="accent" class="space-y-5 p-6">
   <div class="space-y-2">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         {m.common_branding()}
      </p>
      <h2 class="text-lg font-semibold tracking-[-0.03em]">Theme controls</h2>
      <p class="text-muted-foreground text-sm leading-6">
         Tune typography, radius, and light/dark palette tokens for the public
         page.
      </p>
   </div>

   <div class="space-y-2">
      <label class="text-sm font-medium" for="font-family">
         {m.tournamentDashboard_field_font()}
      </label>
      <select
         id="font-family"
         bind:value={fontFamily}
         class="bg-background/75 h-11 w-full rounded-2xl px-4 text-sm ring-1 ring-white/8 transition outline-none focus:ring-white/16"
      >
         <option value="">{m.locale_system()}</option>
         {#each TOURNAMENT_FONT_OPTIONS as font (font)}
            <option value={font}>{font}</option>
         {/each}
      </select>
   </div>

   <div class="space-y-2">
      <label class="text-sm font-medium" for="theme-radius">
         {m.common_radius()}
      </label>
      <Input
         id="theme-radius"
         bind:value={radius}
         inputmode="decimal"
         placeholder="1"
      />
   </div>

   <div class="space-y-3">
      <div class="bg-muted/60 inline-flex rounded-full p-1 shadow-inner">
         <Button
            variant={themeMode === "light" ? "secondary" : "ghost"}
            size="sm"
            class={themeMode === "light"
               ? "bg-chart-3 hover:bg-chart-3/90 rounded-full text-black"
               : "rounded-full"}
            onclick={() => {
               themeMode = "light";
            }}
         >
            {m.common_light()}
         </Button>
         <Button
            variant={themeMode === "dark" ? "secondary" : "ghost"}
            size="sm"
            class={themeMode === "dark"
               ? "bg-chart-5 hover:bg-chart-5/90 rounded-full text-black"
               : "rounded-full"}
            onclick={() => {
               themeMode = "dark";
            }}
         >
            {m.common_dark()}
         </Button>
      </div>

      {#if themeMode === "light"}
         <TournamentThemeFields bind:value={lightTheme} />
      {:else}
         <TournamentThemeFields bind:value={darkTheme} />
      {/if}
   </div>
</Card>
