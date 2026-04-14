<script lang="ts">
   import { m } from "$i18n/messages";
   import { getLocale } from "$i18n/runtime";

   import { Badge } from "@ota/ui/components/badge/index.ts";
   import { Separator } from "@ota/ui/components/separator/index.ts";

   import type { PageProps } from "./$types";

   interface TournamentMediaShape {
      bannerUrl?: string | null;
      iconUrl?: string | null;
      logo?: string | null;
   }

   let { data }: PageProps = $props();
   const media = $derived(
      data.tournament as typeof data.tournament & TournamentMediaShape,
   );

   const locale = $derived(getLocale());
   const dateFormatter = $derived(
      new Intl.DateTimeFormat(locale, {
         dateStyle: "medium",
      }),
   );
   const numberFormatter = $derived(new Intl.NumberFormat(locale));

   const status = $derived.by(() => {
      if (data.tournament.isArchived) {
         return m.tournamentPage_status_archived();
      }

      const now = Date.now();
      const start = new Date(data.tournament.startDate).getTime();
      const end = new Date(data.tournament.endDate).getTime();

      if (now < start) {
         return m.tournamentPage_status_upcoming();
      }

      if (now > end) {
         return m.tournamentPage_status_completed();
      }

      return m.tournamentPage_status_live();
   });

   const durationInDays = $derived.by(() => {
      const start = new Date(data.tournament.startDate).getTime();
      const end = new Date(data.tournament.endDate).getTime();
      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      return Math.max(1, Math.ceil((end - start) / millisecondsPerDay) + 1);
   });

   const formattedDuration = $derived(
      durationInDays === 1
         ? m.tournamentPage_value_singleDay()
         : m.tournamentPage_value_days({
              count: numberFormatter.format(durationInDays),
           }),
   );

   const scheduleWindow = $derived(
      `${dateFormatter.format(new Date(data.tournament.startDate))} - ${dateFormatter.format(new Date(data.tournament.endDate))}`,
   );

   const quickFacts = $derived([
      {
         label: m.tournamentPage_label_tournamentId(),
         value: data.tournament.id,
      },
      {
         label: m.tournamentPage_label_acronym(),
         value: data.tournament.acronym ?? "N/A",
      },
      {
         label: m.tournamentPage_label_rendition(),
         value:
            data.tournament.rendition !== null
               ? numberFormatter.format(data.tournament.rendition)
               : "N/A",
      },
      {
         label: m.common_visibility(),
         value: data.tournament.isPublic
            ? m.common_public()
            : m.common_private(),
      },
   ]);

   const scheduleItems = $derived([
      {
         label: m.common_startDate(),
         value: dateFormatter.format(new Date(data.tournament.startDate)),
      },
      {
         label: m.common_endDate(),
         value: dateFormatter.format(new Date(data.tournament.endDate)),
      },
      {
         label: m.common_duration(),
         value: formattedDuration,
      },
      {
         label: m.tournamentPage_label_scheduleWindow(),
         value: scheduleWindow,
      },
   ]);

   const formatItems = $derived([
      {
         label: m.tournamentPage_label_teamSize(),
         value: numberFormatter.format(data.tournament.teamSize),
      },
      {
         label: m.tournamentPage_label_lobbySize(),
         value: numberFormatter.format(data.tournament.lobbySize),
      },
      {
         label: m.common_status(),
         value: status,
      },
   ]);
</script>

<svelte:head>
   <title>{m.tournamentPage_pageTitle({ name: data.tournament.name })}</title>
</svelte:head>

<div
   class="tournament-page min-h-full"
   style="--tournament-accent: oklch(0.62 0.16 192); --tournament-paper: oklch(0.982 0.012 95); --tournament-ink: oklch(0.2 0.03 220); --tournament-display-font: var(--font-serif); --tournament-body-font: var(--font-sans);"
>
   <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
   >
      <section
         class="hero overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--tournament-paper)]"
      >
         <div
            class="hero-grid grid gap-6 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)] md:p-10"
         >
            <div class="space-y-6">
               <div class="flex flex-wrap items-center gap-3">
                  <span
                     class="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] uppercase"
                  >
                     {m.tournamentPage_eyebrow()}
                  </span>

                  <Badge variant="secondary">
                     {#if data.tournament.isArchived}
                        {m.common_archived()}
                     {:else}
                        {m.common_public()}
                     {/if}
                  </Badge>
               </div>

               <div class="space-y-4">
                  <h1
                     class="max-w-4xl text-4xl leading-none font-semibold tracking-[-0.04em] md:text-6xl"
                     style="font-family: var(--tournament-display-font); color: var(--tournament-ink);"
                  >
                     {data.tournament.name}
                  </h1>

                  <p
                     class="max-w-3xl text-base leading-7 md:text-lg"
                     style="color: color-mix(in oklch, var(--tournament-ink) 72%, white); font-family: var(--tournament-body-font);"
                  >
                     {data.tournament.description ??
                        m.tournamentPage_descriptionFallback()}
                  </p>
               </div>

               <div class="flex flex-wrap items-center gap-3 text-sm">
                  <div
                     class="rounded-full bg-black px-4 py-2 font-medium text-white"
                  >
                     {status}
                  </div>
                  <div
                     class="rounded-full border border-black/10 px-4 py-2 font-medium"
                  >
                     {scheduleWindow}
                  </div>
               </div>
            </div>

            <div class="space-y-4">
               <div
                  class="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/70 p-4 backdrop-blur-sm"
               >
                  <div class="flex items-center gap-4">
                     <div
                        class="grid size-18 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-black/10 bg-white"
                     >
                        {#if media.iconUrl ?? media.logo}
                           <img
                              src={media.iconUrl ?? media.logo ?? undefined}
                              alt={m.tournamentPage_iconAlt({
                                 name: data.tournament.name,
                              })}
                              class="size-full object-cover"
                           />
                        {:else}
                           <span
                              class="text-center text-lg font-semibold tracking-[0.12em] uppercase"
                              style="font-family: var(--tournament-display-font);"
                           >
                              {data.tournament.acronym ??
                                 data.tournament.name.slice(0, 2)}
                           </span>
                        {/if}
                     </div>

                     <div class="min-w-0">
                        <p
                           class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
                        >
                           {m.tournamentPage_section_quickFacts()}
                        </p>
                        <p class="truncate text-xl font-semibold">
                           {data.tournament.id}
                        </p>
                        <p class="text-muted-foreground text-sm">
                           {m.common_branding()}
                        </p>
                     </div>
                  </div>

                  {#if media.bannerUrl}
                     <div
                        class="mt-4 overflow-hidden rounded-[1.25rem] border border-black/10"
                     >
                        <img
                           src={media.bannerUrl}
                           alt={m.tournamentPage_bannerAlt({
                              name: data.tournament.name,
                           })}
                           class="h-44 w-full object-cover"
                        />
                     </div>
                  {:else}
                     <div
                        class="mt-4 rounded-[1.25rem] border border-dashed border-black/10 px-4 py-8 text-sm"
                     >
                        {m.tournamentPage_noBranding()}
                     </div>
                  {/if}
               </div>
            </div>
         </div>
      </section>

      <section
         class="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]"
      >
         <article class="bg-background space-y-4 rounded-[1.75rem] border p-6">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  {m.tournamentPage_section_overview()}
               </p>
               <h2
                  class="text-3xl font-semibold tracking-[-0.03em]"
                  style="font-family: var(--tournament-display-font);"
               >
                  {data.tournament.name}
               </h2>
            </div>

            <Separator />

            <p class="text-muted-foreground text-base leading-7">
               {data.tournament.description ??
                  m.tournamentPage_descriptionFallback()}
            </p>
         </article>

         <article class="bg-background space-y-4 rounded-[1.75rem] border p-6">
            <p
               class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
            >
               {m.tournamentPage_section_quickFacts()}
            </p>

            <dl class="grid gap-3">
               {#each quickFacts as fact (fact.label)}
                  <div class="bg-muted/50 rounded-2xl px-4 py-3">
                     <dt class="text-muted-foreground text-xs uppercase">
                        {fact.label}
                     </dt>
                     <dd class="mt-1 text-base font-semibold break-all">
                        {fact.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>
      </section>

      <section class="grid gap-4 xl:grid-cols-2">
         <article class="bg-background space-y-4 rounded-[1.75rem] border p-6">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  {m.tournamentPage_section_schedule()}
               </p>
               <h2
                  class="text-2xl font-semibold tracking-[-0.03em]"
                  style="font-family: var(--tournament-display-font);"
               >
                  {scheduleWindow}
               </h2>
            </div>

            <dl class="grid gap-3 sm:grid-cols-2">
               {#each scheduleItems as item (item.label)}
                  <div class="bg-muted/35 rounded-2xl border px-4 py-4">
                     <dt class="text-muted-foreground text-xs uppercase">
                        {item.label}
                     </dt>
                     <dd class="mt-2 text-base font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>

         <article class="bg-background space-y-4 rounded-[1.75rem] border p-6">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.16em] uppercase"
               >
                  {m.tournamentPage_section_format()}
               </p>
               <h2
                  class="text-2xl font-semibold tracking-[-0.03em]"
                  style="font-family: var(--tournament-display-font);"
               >
                  {m.tournamentPage_section_format()}
               </h2>
            </div>

            <dl class="grid gap-3">
               {#each formatItems as item (item.label)}
                  <div
                     class="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4"
                  >
                     <dt class="text-muted-foreground text-sm">
                        {item.label}
                     </dt>
                     <dd class="text-right text-lg font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>
      </section>
   </div>
</div>

<style>
   .tournament-page {
      background:
         radial-gradient(
            circle at top left,
            color-mix(in oklch, var(--tournament-accent) 14%, white),
            transparent 34%
         ),
         linear-gradient(
            180deg,
            color-mix(in oklch, var(--tournament-paper) 72%, white),
            transparent 38%
         );
   }

   .hero {
      box-shadow:
         0 1px 0 rgb(0 0 0 / 0.02),
         0 18px 40px rgb(24 32 52 / 0.08);
   }

   .hero-grid {
      background:
         linear-gradient(
            135deg,
            color-mix(in oklch, var(--tournament-accent) 10%, transparent),
            transparent 45%
         ),
         linear-gradient(
            180deg,
            rgb(255 255 255 / 0.78),
            rgb(255 255 255 / 0.92)
         );
   }
</style>
