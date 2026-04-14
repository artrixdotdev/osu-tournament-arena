<script lang="ts">
   import { m } from "$i18n/messages";
   import { getLocale } from "$i18n/runtime";
   import {
      getTournamentFontStack,
      getTournamentFontStylesheetHref,
      getTournamentThemeStyle,
   } from "$lib/tournament-page";

   import {
      Avatar,
      AvatarFallback,
      AvatarImage,
   } from "@ota/ui/components/avatar/index.ts";
   import { Badge } from "@ota/ui/components/badge/index.ts";

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

   const bannerStyle = $derived.by(() => {
      if (!media.bannerUrl) {
         return "";
      }

      return `background-image: linear-gradient(180deg, rgb(12 10 18 / 0.08) 0%, rgb(12 10 18 / 0.55) 50%, rgb(12 10 18 / 0.96) 100%), url(${media.bannerUrl});`;
   });
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
   <section
      class="relative isolate min-h-[24rem] overflow-hidden sm:min-h-[30rem]"
   >
      {#if media.bannerUrl}
         <div
            class="absolute inset-0 bg-cover bg-center"
            style={bannerStyle}
            aria-hidden="true"
         ></div>
      {:else}
         <div
            class="from-primary/24 via-secondary/14 to-background absolute inset-0 bg-gradient-to-br"
            aria-hidden="true"
         ></div>
      {/if}
      <div
         class="from-background/10 via-background/45 to-background absolute inset-0 bg-gradient-to-t"
         aria-hidden="true"
      ></div>

      <div
         class="relative flex min-h-[24rem] items-end px-4 py-8 sm:min-h-[30rem] sm:px-6 lg:px-8 2xl:px-12"
      >
         <div class="max-w-4xl space-y-5">
            <div class="flex flex-wrap items-center gap-2">
               <Badge class="bg-background/70 text-foreground border-0">
                  {m.tournamentPage_eyebrow()}
               </Badge>
               <Badge variant="secondary">{status}</Badge>
               <Badge
                  class="bg-secondary/85 text-secondary-foreground border-0"
               >
                  {#if data.tournament.isArchived}
                     {m.common_archived()}
                  {:else if data.isStaffView && !data.tournament.isPublic}
                     {m.common_private()}
                  {:else}
                     {m.common_public()}
                  {/if}
               </Badge>
            </div>

            <div class="flex items-end gap-4 sm:gap-5">
               <Avatar
                  class="bg-card/80 size-24 rounded-[1.8rem] shadow-[0_18px_45px_rgb(0_0_0_/_0.25)] sm:size-32"
               >
                  <AvatarImage
                     src={media.iconUrl ?? media.logo ?? undefined}
                     alt={m.tournamentPage_iconAlt({
                        name: data.tournament.name,
                     })}
                     class="object-cover"
                  />
                  <AvatarFallback
                     class="rounded-[1.8rem] text-2xl font-semibold uppercase"
                  >
                     {data.tournament.acronym ??
                        data.tournament.name.slice(0, 2)}
                  </AvatarFallback>
               </Avatar>

               <div class="space-y-3 pb-1">
                  <h1
                     class="text-4xl font-[family:var(--tournament-display-font)] font-semibold tracking-[-0.05em] text-white drop-shadow-[0_8px_24px_rgb(0_0_0_/_0.35)] sm:text-6xl"
                  >
                     {data.tournament.name}
                  </h1>
                  <p
                     class="max-w-3xl text-sm leading-7 text-white/78 sm:text-lg"
                  >
                     {data.tournament.description ??
                        m.tournamentPage_descriptionFallback()}
                  </p>
               </div>
            </div>
         </div>
      </div>
   </section>

   <div
      class="-mt-10 grid w-full gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1.65fr)_24rem] lg:px-8 lg:pb-10 2xl:px-12"
   >
      <section class="space-y-5">
         <article
            class="bg-card/86 relative space-y-6 rounded-[2.2rem] p-6 shadow-[0_28px_70px_rgb(0_0_0_/_0.18)] sm:p-8"
         >
            <div
               class="from-secondary/18 to-chart-3/10 pointer-events-none absolute inset-x-0 top-0 h-36 rounded-t-[2.2rem] bg-gradient-to-r via-transparent"
               aria-hidden="true"
            ></div>

            <div class="relative flex flex-wrap items-center gap-3">
               <Badge
                  class="bg-background/82 text-foreground border-0 shadow-none"
               >
                  {scheduleWindow}
               </Badge>
               <Badge
                  class="bg-secondary/82 text-secondary-foreground border-0 shadow-none"
               >
                  {formattedDuration}
               </Badge>
               <Badge
                  class="text-foreground border-0 bg-[hsl(var(--chart-3)/0.16)] shadow-none"
               >
                  {status}
               </Badge>
            </div>

            {#if data.pageContent?.renderedHtml.trim()}
               <div
                  class="prose-content prose prose-a:text-[hsl(var(--tp-primary-current))] prose-img:rounded-[calc(var(--tp-radius-current)+0.2rem)] prose-pre:rounded-[calc(var(--tp-radius-current)+0.1rem)] prose-code:before:hidden prose-code:after:hidden max-w-none [&_h1]:font-[family:var(--tournament-display-font)] [&_h2]:font-[family:var(--tournament-display-font)] [&_h3]:font-[family:var(--tournament-display-font)]"
               >
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html data.pageContent.renderedHtml}
               </div>
            {:else}
               <p
                  class="max-w-3xl leading-8 text-[hsl(var(--tp-muted-foreground-current))]"
               >
                  {m.tournamentPage_customContentEmpty()}
               </p>
            {/if}
         </article>
      </section>

      <aside class="space-y-4 lg:sticky lg:top-6 lg:self-start">
         <article
            class="from-card/95 to-secondary/14 space-y-4 rounded-[2rem] bg-gradient-to-br p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]"
         >
            <div class="space-y-2">
               <p
                  class="text-xs tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
               >
                  {m.tournamentPage_section_quickFacts()}
               </p>
               <div class="grid grid-cols-2 gap-3">
                  <div
                     class="bg-secondary/34 rounded-[1.35rem] px-4 py-3 shadow-sm"
                  >
                     <p
                        class="text-[11px] tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
                     >
                        {m.tournamentPage_label_teamSize()}
                     </p>
                     <p class="mt-2 text-2xl font-semibold">
                        {data.tournament.teamSize}
                     </p>
                  </div>
                  <div
                     class="rounded-[1.35rem] bg-[hsl(var(--chart-3)/0.2)] px-4 py-3 shadow-sm"
                  >
                     <p
                        class="text-[11px] tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
                     >
                        {m.tournamentPage_label_lobbySize()}
                     </p>
                     <p class="mt-2 text-2xl font-semibold">
                        {data.tournament.lobbySize}
                     </p>
                  </div>
               </div>
            </div>

            <dl class="space-y-3">
               {#each quickFacts as fact (fact.label)}
                  <div class="bg-background/46 rounded-[1.25rem] px-4 py-3">
                     <dt
                        class="text-[11px] tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
                     >
                        {fact.label}
                     </dt>
                     <dd class="mt-1 font-semibold break-all">
                        {fact.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>

         <article
            class="from-card/95 to-chart-2/8 space-y-4 rounded-[2rem] bg-gradient-to-br p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]"
         >
            <p
               class="text-xs tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
            >
               {m.tournamentPage_section_schedule()}
            </p>
            <dl class="space-y-3">
               {#each scheduleItems as item (item.label)}
                  <div
                     class="bg-background/46 flex items-start justify-between gap-4 rounded-[1.25rem] px-4 py-3"
                  >
                     <dt
                        class="text-sm text-[hsl(var(--tp-muted-foreground-current))]"
                     >
                        {item.label}
                     </dt>
                     <dd class="text-right font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>

         <article
            class="from-card/95 to-chart-5/8 space-y-4 rounded-[2rem] bg-gradient-to-br p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]"
         >
            <p
               class="text-xs tracking-[0.14em] text-[hsl(var(--tp-muted-foreground-current))] uppercase"
            >
               {m.tournamentPage_section_format()}
            </p>
            <dl class="space-y-3">
               {#each formatItems as item (item.label)}
                  <div
                     class="bg-background/46 flex items-start justify-between gap-4 rounded-[1.25rem] px-4 py-3"
                  >
                     <dt
                        class="text-sm text-[hsl(var(--tp-muted-foreground-current))]"
                     >
                        {item.label}
                     </dt>
                     <dd class="text-right font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </article>
      </aside>
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

   .prose-content {
      max-width: 100%;
   }
</style>
