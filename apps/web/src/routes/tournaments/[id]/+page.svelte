<script lang="ts">
   import {
      CalendarIcon,
      MeetingRoomIcon,
      SquareLock01Icon,
      SquareUnlock01Icon,
      UserGroupIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import {
      formatTournamentDateRange,
      getTournamentFontHref,
      getTournamentInitials,
      getTournamentScopeStyle,
      getTournamentWindowLabel,
   } from "$lib/tournament-ui";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Accordion from "@ota/ui/components/accordion/index.ts";

   import type { PageData } from "./$types";

   let { data }: { data: PageData } = $props();

   const tournament = $derived(data.tournament!);
   const content = $derived(data.content!);
   const canManage = $derived(data.canManage ?? false);
   const fontHref = $derived(getTournamentFontHref(content.fontFamily));
   const scopeStyle = $derived(
      getTournamentScopeStyle(content.themeColors ?? {}, content.fontFamily),
   );
   const tournamentInitials = $derived(
      getTournamentInitials(tournament.name, tournament.acronym),
   );
   const dateRange = $derived(
      formatTournamentDateRange(tournament.startDate, tournament.endDate),
   );
   const tournamentState = $derived(
      tournament.isArchived
         ? "Archived"
         : getTournamentWindowLabel(tournament.startDate, tournament.endDate),
   );
   const visibilityLabel = $derived(
      tournament.isPublic ? "Public" : "Hidden",
   );
   const infoItems = $derived([
      {
         icon: CalendarIcon,
         label: "Window",
         value: dateRange,
      },
      {
         icon: UserGroupIcon,
         label: "Roster format",
         value: `${tournament.teamSize} players per team`,
      },
      {
         icon: MeetingRoomIcon,
         label: "Lobby size",
         value: `${tournament.lobbySize} player slots`,
      },
      {
         icon: tournament.isPublic ? SquareUnlock01Icon : SquareLock01Icon,
         label: "Visibility",
         value: visibilityLabel,
      },
   ]);
</script>

<svelte:head>
   <title>{tournament.name}</title>
   {#if fontHref}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
         rel="preconnect"
         href="https://fonts.gstatic.com"
         crossorigin="anonymous"
      />
      <link href={fontHref} rel="stylesheet" />
   {/if}
</svelte:head>

<div
   class="tournament-page-scope min-h-full px-4 py-6 sm:px-6 lg:px-8"
   style={scopeStyle}
>
   <div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div class="space-y-6">
         <section class="hero-panel overflow-hidden rounded-[1.75rem] border">
            <div class="hero-stripes"></div>
            <div
               class="relative flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-end lg:justify-between"
            >
               <div class="space-y-4">
                  <div class="flex items-center gap-4">
                     {#if tournament.logo?.trim()}
                        <img
                           src={tournament.logo}
                           alt={`${tournament.name} logo`}
                           class="h-18 w-18 rounded-2xl border object-cover shadow-sm"
                        />
                     {:else}
                        <div
                           class="tournament-logo-placeholder flex h-18 w-18 items-center justify-center rounded-2xl border text-xl font-semibold"
                        >
                           {tournamentInitials}
                        </div>
                     {/if}

                     <div class="space-y-2">
                        <p
                           class="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[hsl(var(--t-mutedForeground))]"
                        >
                           Tournament dossier
                        </p>
                        <div class="flex flex-wrap items-center gap-2">
                           <span class="status-pill">{tournamentState}</span>
                           <span class="status-pill">{visibilityLabel}</span>
                           <span class="status-pill">{tournament.id}</span>
                        </div>
                     </div>
                  </div>

                  <div class="space-y-3">
                     <h1 class="text-balance text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-none tracking-[-0.04em]">
                        {tournament.name}
                     </h1>
                     <p class="max-w-3xl text-base leading-7 text-[hsl(var(--t-mutedForeground))] sm:text-lg">
                        {tournament.description?.trim() ||
                           "The tournament page is live. Staff can use the dashboard to add rules, schedule notes, branding, and registration guidance."}
                     </p>
                  </div>
               </div>

               <div class="flex flex-wrap items-center gap-3">
                  {#if canManage}
                     <Button
                        href={`/tournament/${tournament.id}/dashboard`}
                        variant="outline"
                        class="min-w-36 border-[hsl(var(--t-border))] bg-[hsl(var(--t-background))]/80"
                     >
                        Open dashboard
                     </Button>
                  {/if}
               </div>
            </div>
         </section>

         <Accordion.Root
            type="multiple"
            value={["overview", "guide"]}
            class="rounded-[1.5rem] border px-5 py-2 sm:px-6"
         >
            <Accordion.Item value="overview" class="border-b border-[hsl(var(--t-border))]">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Overview</p>
                     <p class="text-sm font-normal text-[hsl(var(--t-mutedForeground))]">
                        The essentials players need before they scroll any deeper.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 sm:grid-cols-2">
                     {#each infoItems as item (item.label)}
                        <div class="info-tile">
                           <div class="info-icon">
                              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.7} />
                           </div>
                           <div class="space-y-1">
                              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
                                 {item.label}
                              </p>
                              <p class="text-base font-medium">{item.value}</p>
                           </div>
                        </div>
                     {/each}
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="format" class="border-b border-[hsl(var(--t-border))]">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Format</p>
                     <p class="text-sm font-normal text-[hsl(var(--t-mutedForeground))]">
                        Team sizing, lobby expectations, and tournament timing.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                     <div class="space-y-2">
                        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
                           Competition setup
                        </p>
                        <p class="text-base leading-7">
                           Teams field <strong>{tournament.teamSize}</strong> players,
                           and each lobby supports up to <strong>{tournament.lobbySize}</strong>
                           players at a time.
                        </p>
                     </div>
                     <div class="space-y-2">
                        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
                           Calendar
                        </p>
                        <p class="text-base leading-7">
                           The event runs <strong>{dateRange}</strong>.
                        </p>
                     </div>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="guide">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Tournament guide</p>
                     <p class="text-sm font-normal text-[hsl(var(--t-mutedForeground))]">
                        Rules, registration instructions, schedule notes, and everything else staff publish.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  {#if content.renderedBody.trim()}
                     <article class="prose-content">
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html content.renderedBody}
                     </article>
                  {:else}
                     <div class="empty-state">
                        <p class="text-base font-medium">Nothing published yet.</p>
                        <p class="text-sm text-[hsl(var(--t-mutedForeground))]">
                           This tournament page is ready, but staff have not published the guide content yet.
                        </p>
                        {#if canManage}
                           <Button
                              href={`/tournament/${tournament.id}/dashboard#public-page`}
                              variant="outline"
                              class="mt-2 border-[hsl(var(--t-border))] bg-transparent"
                           >
                              Add public page content
                           </Button>
                        {/if}
                     </div>
                  {/if}
               </Accordion.Content>
            </Accordion.Item>
         </Accordion.Root>
      </div>

      <aside class="space-y-4 lg:pt-4">
         <section class="aside-panel rounded-[1.5rem] border p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
               Snapshot
            </p>
            <div class="mt-4 space-y-4">
               {#each infoItems as item (item.label)}
                  <div class="space-y-1">
                     <p class="text-sm text-[hsl(var(--t-mutedForeground))]">
                        {item.label}
                     </p>
                     <p class="font-medium">{item.value}</p>
                  </div>
               {/each}
            </div>
         </section>

         {#if canManage}
            <section class="aside-panel rounded-[1.5rem] border p-5">
               <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
                  Staff controls
               </p>
               <p class="mt-3 text-sm leading-6 text-[hsl(var(--t-mutedForeground))]">
                  Manage tournament details, publishing, screening rules, and page branding from the dedicated dashboard.
               </p>
               <Button
                  href={`/tournament/${tournament.id}/dashboard`}
                  class="mt-4 w-full"
               >
                  Manage tournament
               </Button>
            </section>
         {/if}
      </aside>
   </div>
</div>

<style>
   .tournament-page-scope {
      --t-background: var(--background);
      --t-foreground: var(--foreground);
      --t-card: var(--card);
      --t-cardForeground: var(--card-foreground);
      --t-primary: var(--primary);
      --t-primaryForeground: var(--primary-foreground);
      --t-secondary: var(--secondary);
      --t-secondaryForeground: var(--secondary-foreground);
      --t-muted: var(--muted);
      --t-mutedForeground: var(--muted-foreground);
      --t-accent: var(--accent);
      --t-accentForeground: var(--accent-foreground);
      --t-border: var(--border);
      --t-input: var(--input);
      --t-ring: var(--ring);
      background: hsl(var(--t-background));
      color: hsl(var(--t-foreground));
      font-family: var(--t-font, inherit);
   }

   .hero-panel,
   .aside-panel {
      border-color: hsl(var(--t-border));
      background:
         linear-gradient(
            180deg,
            hsl(var(--t-background) / 0.98),
            hsl(var(--t-card) / 0.92)
         );
      box-shadow: 0 1px 0 hsl(var(--t-border) / 0.5);
   }

   .hero-panel {
      position: relative;
      isolation: isolate;
   }

   .hero-stripes {
      position: absolute;
      inset: 0;
      background:
         linear-gradient(180deg, transparent, hsl(var(--t-background) / 0.16)),
         repeating-linear-gradient(
            115deg,
            hsl(var(--t-primary) / 0.08) 0,
            hsl(var(--t-primary) / 0.08) 1px,
            transparent 1px,
            transparent 24px
         );
      opacity: 0.8;
      pointer-events: none;
   }

   .tournament-logo-placeholder {
      background: hsl(var(--t-muted));
      color: hsl(var(--t-mutedForeground));
      border-color: hsl(var(--t-border));
   }

   .status-pill {
      border: 1px solid hsl(var(--t-border));
      border-radius: 999px;
      background: hsl(var(--t-card) / 0.9);
      padding: 0.38rem 0.8rem;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: hsl(var(--t-mutedForeground));
   }

   .info-tile {
      display: flex;
      gap: 0.9rem;
      align-items: flex-start;
      border: 1px solid hsl(var(--t-border));
      border-radius: 1rem;
      padding: 1rem;
      background: hsl(var(--t-card) / 0.78);
   }

   .info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.9rem;
      background: hsl(var(--t-muted));
      color: hsl(var(--t-foreground));
   }

   .empty-state {
      border: 1px dashed hsl(var(--t-border));
      border-radius: 1rem;
      padding: 1.25rem;
      background: hsl(var(--t-muted) / 0.45);
   }

   .prose-content :global(a) {
      color: hsl(var(--t-primary));
      text-decoration: underline;
   }

   .prose-content :global(code) {
      background: hsl(var(--t-muted));
      padding: 0.12rem 0.3rem;
      border-radius: 0.25rem;
   }

   .prose-content :global(pre) {
      background: hsl(var(--t-muted));
      border: 1px solid hsl(var(--t-border));
      border-radius: 0.5rem;
      padding: 1rem;
      overflow-x: auto;
   }

   .prose-content :global(img),
   .prose-content :global(video),
   .prose-content :global(audio) {
      display: block;
      max-width: 100%;
      border-radius: 1rem;
      border: 1px solid hsl(var(--t-border));
      margin: 1.25rem 0;
   }

   .prose-content :global(table) {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid hsl(var(--t-border));
      margin: 1rem 0;
   }

   .prose-content :global(th),
   .prose-content :global(td) {
      border: 1px solid hsl(var(--t-border));
      padding: 0.5rem;
      text-align: left;
   }

   .prose-content :global(blockquote) {
      border-left: 3px solid hsl(var(--t-accent));
      padding-left: 1rem;
      color: hsl(var(--t-mutedForeground));
      margin: 1rem 0;
   }

   .prose-content :global(h1),
   .prose-content :global(h2),
   .prose-content :global(h3) {
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin-top: 1.5rem;
      margin-bottom: 0.8rem;
   }

   .prose-content :global(p),
   .prose-content :global(li) {
      line-height: 1.8;
   }
</style>
