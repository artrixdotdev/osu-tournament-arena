<script lang="ts">
   import { m } from "$i18n/messages";
   import { getLocale } from "$i18n/runtime";
   import {
      getTournamentFontStack,
      getTournamentFontStylesheetHref,
      getTournamentThemeStyle,
   } from "$lib/tournament-page";

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
   const fontStylesheetHref = $derived(
      getTournamentFontStylesheetHref(data.pageContent?.content?.fontFamily),
   );
   const wrapperStyle = $derived.by(() => {
      const themeStyle = getTournamentThemeStyle(
         data.pageContent?.content?.theme,
      );
      const fontStack = getTournamentFontStack(
         data.pageContent?.content?.fontFamily,
      );

      return `${themeStyle} --tournament-display-font: ${fontStack}; --tournament-body-font: ${fontStack};`;
   });

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
   {#if fontStylesheetHref}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
         rel="preconnect"
         href="https://fonts.gstatic.com"
         crossorigin="anonymous"
      />
      <link rel="stylesheet" href={fontStylesheetHref} />
   {/if}
</svelte:head>

<div class="tournament-page min-h-full" style={wrapperStyle}>
   <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
   >
      <section class="hero overflow-hidden">
         <div
            class="hero-grid grid gap-6 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)] md:p-10"
         >
            <div class="space-y-6">
               <div class="flex flex-wrap items-center gap-3">
                  <span class="hero-eyebrow">
                     {m.tournamentPage_eyebrow()}
                  </span>

                  <Badge variant="secondary">
                     {#if data.tournament.isArchived}
                        {m.common_archived()}
                     {:else if data.isStaffView && !data.tournament.isPublic}
                        {m.common_private()}
                     {:else}
                        {m.common_public()}
                     {/if}
                  </Badge>
               </div>

               <div class="space-y-4">
                  <h1 class="hero-title">
                     {data.tournament.name}
                  </h1>

                  <p class="hero-copy">
                     {data.tournament.description ??
                        m.tournamentPage_descriptionFallback()}
                  </p>
               </div>

               <div class="flex flex-wrap items-center gap-3 text-sm">
                  <div class="status-pill">
                     {status}
                  </div>
                  <div class="info-pill">
                     {scheduleWindow}
                  </div>
               </div>
            </div>

            <div class="space-y-4">
               <div class="side-panel p-4">
                  <div class="flex items-center gap-4">
                     <div class="brand-lockup">
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
                           >
                              {data.tournament.acronym ??
                                 data.tournament.name.slice(0, 2)}
                           </span>
                        {/if}
                     </div>

                     <div class="min-w-0">
                        <p class="section-kicker">
                           {m.tournamentPage_section_quickFacts()}
                        </p>
                        <p class="truncate text-xl font-semibold">
                           {data.tournament.id}
                        </p>
                        <p class="text-sm opacity-70">
                           {m.common_branding()}
                        </p>
                     </div>
                  </div>

                  {#if media.bannerUrl}
                     <div class="banner-frame mt-4">
                        <img
                           src={media.bannerUrl}
                           alt={m.tournamentPage_bannerAlt({
                              name: data.tournament.name,
                           })}
                           class="h-44 w-full object-cover"
                        />
                     </div>
                  {:else}
                     <div class="empty-branding mt-4">
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
         <article class="t-card space-y-4 p-6">
            <div class="space-y-2">
               <p class="section-kicker">
                  {m.tournamentPage_section_overview()}
               </p>
               <h2 class="section-title text-3xl">
                  {data.tournament.name}
               </h2>
            </div>

            <Separator />

            <p class="section-copy">
               {data.tournament.description ??
                  m.tournamentPage_descriptionFallback()}
            </p>
         </article>

         <article class="t-card space-y-4 p-6">
            <p class="section-kicker">
               {m.tournamentPage_section_quickFacts()}
            </p>

            <dl class="grid gap-3">
               {#each quickFacts as fact (fact.label)}
                  <div class="t-muted-block">
                     <dt class="text-xs uppercase opacity-70">
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
         <article class="t-card space-y-4 p-6">
            <div class="space-y-2">
               <p class="section-kicker">
                  {m.tournamentPage_section_schedule()}
               </p>
               <h2 class="section-title text-2xl">
                  {scheduleWindow}
               </h2>
            </div>

            <dl class="grid gap-3 sm:grid-cols-2">
               {#each scheduleItems as item (item.label)}
                  <div class="t-block">
                     <dt class="text-xs uppercase opacity-70">
                        {item.label}
                     </dt>
                     <dd class="mt-2 text-base font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>

         <article class="t-card space-y-4 p-6">
            <div class="space-y-2">
               <p class="section-kicker">
                  {m.tournamentPage_section_format()}
               </p>
               <h2 class="section-title text-2xl">
                  {m.tournamentPage_section_format()}
               </h2>
            </div>

            <dl class="grid gap-3">
               {#each formatItems as item (item.label)}
                  <div class="t-block flex items-center justify-between gap-4">
                     <dt class="text-sm opacity-70">
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

      <section class="t-card space-y-4 p-6">
         <div class="space-y-2">
            <p class="section-kicker">{m.labels_content()}</p>
            <h2 class="section-title text-3xl">{m.labels_content()}</h2>
         </div>

         <Separator />

         {#if data.pageContent?.renderedHtml.trim()}
            <div
               class="prose-content prose prose-zinc dark:prose-invert prose-img:rounded-[calc(var(--tp-radius-current)+0.2rem)] prose-pre:rounded-[calc(var(--tp-radius-current)+0.1rem)] prose-code:before:hidden prose-code:after:hidden max-w-none [&_h1]:font-[family:var(--tournament-display-font)] [&_h2]:font-[family:var(--tournament-display-font)] [&_h3]:font-[family:var(--tournament-display-font)]"
            >
               <!-- eslint-disable-next-line svelte/no-at-html-tags -->
               {@html data.pageContent.renderedHtml}
            </div>
         {:else}
            <p class="section-copy">
               {m.tournamentPage_customContentEmpty()}
            </p>
         {/if}
      </section>
   </div>
</div>

<style>
   .tournament-page {
      --tp-background-current: var(--tp-light-background, var(--background));
      --tp-foreground-current: var(--tp-light-foreground, var(--foreground));
      --tp-card-current: var(--tp-light-card, var(--card));
      --tp-card-foreground-current: var(
         --tp-light-cardForeground,
         var(--card-foreground)
      );
      --tp-muted-current: var(--tp-light-muted, var(--muted));
      --tp-muted-foreground-current: var(
         --tp-light-mutedForeground,
         var(--muted-foreground)
      );
      --tp-primary-current: var(--tp-light-primary, var(--primary));
      --tp-primary-foreground-current: var(
         --tp-light-primaryForeground,
         var(--primary-foreground)
      );
      --tp-border-current: var(--tp-light-border, var(--border));
      --tp-radius-current: var(--tp-radius, 1rem);
      color: hsl(var(--tp-foreground-current));
      background:
         radial-gradient(
            circle at top left,
            hsl(var(--tp-primary-current) / 0.14),
            transparent 34%
         ),
         linear-gradient(
            180deg,
            hsl(var(--tp-background-current)),
            transparent 42%
         );
      font-family: var(--tournament-body-font);
      --tw-prose-body: hsl(var(--tp-muted-foreground-current));
      --tw-prose-headings: hsl(var(--tp-card-foreground-current));
      --tw-prose-lead: hsl(var(--tp-muted-foreground-current));
      --tw-prose-links: hsl(var(--tp-primary-current));
      --tw-prose-bold: hsl(var(--tp-card-foreground-current));
      --tw-prose-counters: hsl(var(--tp-muted-foreground-current));
      --tw-prose-bullets: hsl(var(--tp-primary-current));
      --tw-prose-hr: hsl(var(--tp-border-current));
      --tw-prose-quotes: hsl(var(--tp-card-foreground-current));
      --tw-prose-quote-borders: hsl(var(--tp-border-current));
      --tw-prose-captions: hsl(var(--tp-muted-foreground-current));
      --tw-prose-code: hsl(var(--tp-card-foreground-current));
      --tw-prose-pre-code: hsl(var(--tp-card-foreground-current));
      --tw-prose-pre-bg: hsl(var(--tp-muted-current));
      --tw-prose-th-borders: hsl(var(--tp-border-current));
      --tw-prose-td-borders: hsl(var(--tp-border-current));
   }

   :global(.dark) .tournament-page {
      --tp-background-current: var(
         --tp-dark-background,
         var(--tp-light-background, var(--background))
      );
      --tp-foreground-current: var(
         --tp-dark-foreground,
         var(--tp-light-foreground, var(--foreground))
      );
      --tp-card-current: var(--tp-dark-card, var(--tp-light-card, var(--card)));
      --tp-card-foreground-current: var(
         --tp-dark-cardForeground,
         var(--tp-light-cardForeground, var(--card-foreground))
      );
      --tp-muted-current: var(
         --tp-dark-muted,
         var(--tp-light-muted, var(--muted))
      );
      --tp-muted-foreground-current: var(
         --tp-dark-mutedForeground,
         var(--tp-light-mutedForeground, var(--muted-foreground))
      );
      --tp-primary-current: var(
         --tp-dark-primary,
         var(--tp-light-primary, var(--primary))
      );
      --tp-primary-foreground-current: var(
         --tp-dark-primaryForeground,
         var(--tp-light-primaryForeground, var(--primary-foreground))
      );
      --tp-border-current: var(
         --tp-dark-border,
         var(--tp-light-border, var(--border))
      );
   }

   .hero,
   .t-card,
   .side-panel {
      border: 1px solid hsl(var(--tp-border-current) / 0.6);
      border-radius: calc(var(--tp-radius-current) + 0.5rem);
      background: hsl(var(--tp-card-current) / 0.94);
      color: hsl(var(--tp-card-foreground-current));
   }

   .hero {
      overflow: hidden;
      box-shadow:
         0 1px 0 rgb(0 0 0 / 0.02),
         0 18px 40px rgb(24 32 52 / 0.08);
   }

   .hero-grid {
      background:
         linear-gradient(
            135deg,
            hsl(var(--tp-primary-current) / 0.12),
            transparent 45%
         ),
         linear-gradient(
            180deg,
            hsl(var(--tp-card-current) / 0.8),
            hsl(var(--tp-card-current) / 0.96)
         );
   }

   .hero-title,
   .section-title {
      font-family: var(--tournament-display-font);
      line-height: 0.95;
      letter-spacing: -0.04em;
   }

   .hero-title {
      max-width: 48rem;
      font-size: clamp(2.75rem, 6vw, 5.5rem);
      font-weight: 700;
   }

   .hero-copy,
   .section-copy {
      max-width: 44rem;
      color: hsl(var(--tp-muted-foreground-current));
      line-height: 1.8;
   }

   .hero-eyebrow,
   .section-kicker {
      color: hsl(var(--tp-muted-foreground-current));
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-size: 0.75rem;
   }

   .hero-eyebrow {
      border: 1px solid hsl(var(--tp-border-current) / 0.7);
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      font-weight: 700;
   }

   .status-pill {
      border-radius: 999px;
      padding: 0.65rem 1rem;
      background: hsl(var(--tp-primary-current));
      color: hsl(var(--tp-primary-foreground-current));
      font-weight: 600;
   }

   .info-pill {
      border-radius: 999px;
      padding: 0.65rem 1rem;
      border: 1px solid hsl(var(--tp-border-current) / 0.7);
      background: hsl(var(--tp-card-current) / 0.55);
      color: hsl(var(--tp-card-foreground-current));
      font-weight: 500;
   }

   .brand-lockup {
      display: grid;
      place-items: center;
      width: 4.5rem;
      height: 4.5rem;
      border-radius: calc(var(--tp-radius-current) + 0.15rem);
      border: 1px solid hsl(var(--tp-border-current) / 0.7);
      background: hsl(var(--tp-card-current));
      overflow: hidden;
   }

   .banner-frame,
   .empty-branding,
   .t-block,
   .t-muted-block {
      border-radius: calc(var(--tp-radius-current) + 0.1rem);
   }

   .banner-frame,
   .t-block {
      border: 1px solid hsl(var(--tp-border-current) / 0.6);
      background: hsl(var(--tp-card-current) / 0.6);
   }

   .t-block {
      padding: 1rem;
   }

   .t-muted-block,
   .empty-branding {
      background: hsl(var(--tp-muted-current) / 0.62);
      color: hsl(var(--tp-card-foreground-current));
      padding: 0.95rem 1rem;
   }

   .empty-branding {
      border: 1px dashed hsl(var(--tp-border-current) / 0.75);
      font-size: 0.95rem;
   }

   .prose-content {
      max-width: 100%;
   }
</style>
