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
   import { Card } from "@ota/ui/components/card/index.ts";

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
   <div
      class="grid w-full gap-6 px-4 pt-4 pb-8 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1.65fr)_24rem] lg:px-8 lg:pb-10 2xl:px-12"
   >
      <section class="tournament-shell min-w-0 space-y-6">
         <section
            class="relative isolate min-h-[26rem] overflow-hidden rounded-[2.25rem] sm:min-h-[32rem] lg:min-h-[36rem]"
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
               class="from-background/0 via-background/28 to-background absolute inset-0 bg-gradient-to-b"
               aria-hidden="true"
            ></div>
            <div
               class="from-background/0 via-background/10 to-background absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t sm:h-56"
               aria-hidden="true"
            ></div>

            <div
               class="relative flex min-h-[26rem] items-end px-4 pt-10 pb-10 sm:min-h-[32rem] sm:px-6 sm:pt-12 sm:pb-12 lg:min-h-[36rem] lg:px-8 lg:pb-16 2xl:px-12"
            >
               <div class="max-w-4xl space-y-5">
                  <div class="flex flex-wrap items-center gap-2">
                     <Badge class="bg-background/72 text-foreground border-0">
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

                  <div
                     class="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-5"
                  >
                     <Avatar
                        class="bg-card/82 size-20 rounded-[1.65rem] shadow-[0_18px_45px_rgb(0_0_0_/_0.25)] sm:size-28 lg:size-32"
                     >
                        <AvatarImage
                           src={media.iconUrl ?? media.logo ?? undefined}
                           alt={m.tournamentPage_iconAlt({
                              name: data.tournament.name,
                           })}
                           class="object-cover"
                        />
                        <AvatarFallback
                           class="rounded-[1.65rem] text-xl font-semibold uppercase sm:text-2xl"
                        >
                           {data.tournament.acronym ??
                              data.tournament.name.slice(0, 2)}
                        </AvatarFallback>
                     </Avatar>

                     <div class="space-y-3 sm:pb-1">
                        <h1
                           class="text-4xl font-[family:var(--tournament-display-font)] font-semibold tracking-[-0.05em] text-white drop-shadow-[0_8px_24px_rgb(0_0_0_/_0.35)] sm:text-5xl lg:text-6xl"
                        >
                           {data.tournament.name}
                        </h1>
                        <p
                           class="max-w-3xl text-sm leading-7 text-white/78 sm:text-base lg:text-lg"
                        >
                           {data.tournament.description ??
                              m.tournamentPage_descriptionFallback()}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <Card
            as="article"
            class="bg-card/86 space-y-6 rounded-[2.2rem] p-6 sm:p-8"
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
         </Card>
      </section>

      <aside class="space-y-4 pt-2 lg:sticky lg:top-6 lg:self-start lg:pt-24">
         <Card as="article" variant="secondary" class="space-y-4 p-5">
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
               >
                  {m.tournamentPage_section_quickFacts()}
               </p>
               <div class="grid grid-cols-2 gap-3">
                  <div
                     class="bg-secondary/34 rounded-[1.35rem] px-4 py-3 shadow-sm"
                  >
                     <p
                        class="text-muted-foreground text-[11px] tracking-[0.14em] uppercase"
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
                        class="text-muted-foreground text-[11px] tracking-[0.14em] uppercase"
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
                        class="text-muted-foreground text-[11px] tracking-[0.14em] uppercase"
                     >
                        {fact.label}
                     </dt>
                     <dd class="mt-1 font-semibold break-all">
                        {fact.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </Card>

         <Card as="article" variant="chart2" class="space-y-4 p-5">
            <p
               class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
            >
               {m.tournamentPage_section_schedule()}
            </p>
            <dl class="space-y-3">
               {#each scheduleItems as item (item.label)}
                  <div
                     class="bg-background/46 flex items-start justify-between gap-4 rounded-[1.25rem] px-4 py-3"
                  >
                     <dt class="text-muted-foreground text-sm">
                        {item.label}
                     </dt>
                     <dd class="text-right font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </Card>

         <Card as="article" variant="chart5" class="space-y-4 p-5">
            <p
               class="text-muted-foreground text-xs tracking-[0.14em] uppercase"
            >
               {m.tournamentPage_section_format()}
            </p>
            <dl class="space-y-3">
               {#each formatItems as item (item.label)}
                  <div
                     class="bg-background/46 flex items-start justify-between gap-4 rounded-[1.25rem] px-4 py-3"
                  >
                     <dt class="text-muted-foreground text-sm">
                        {item.label}
                     </dt>
                     <dd class="text-right font-semibold">
                        {item.value}
                     </dd>
                  </div>
               {/each}
            </dl>
         </Card>
      </aside>
   </div>
</div>

<style>
   .tournament-page {
      --tp-site-background: var(--background);
      --tp-site-foreground: var(--foreground);
      --tp-site-card: var(--card);
      --tp-site-card-foreground: var(--card-foreground);
      --tp-site-muted: var(--muted);
      --tp-site-muted-foreground: var(--muted-foreground);
      --tp-site-primary: var(--primary);
      --tp-site-primary-foreground: var(--primary-foreground);
      --tp-site-secondary: var(--secondary);
      --tp-site-secondary-foreground: var(--secondary-foreground);
      --tp-site-accent: var(--accent);
      --tp-site-accent-foreground: var(--accent-foreground);
      --tp-site-border: var(--border);
      --tp-site-input: var(--input);
      --tp-site-ring: var(--ring);
      --tp-site-radius: var(--radius);
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
      color: hsl(var(--tp-foreground-current));
   }

   .tournament-shell {
      --background: var(--tp-light-background, var(--tp-site-background));
      --foreground: var(--tp-light-foreground, var(--tp-site-foreground));
      --card: var(--tp-light-card, var(--tp-site-card));
      --card-foreground: var(
         --tp-light-cardForeground,
         var(--tp-site-card-foreground)
      );
      --muted: var(--tp-light-muted, var(--tp-site-muted));
      --muted-foreground: var(
         --tp-light-mutedForeground,
         var(--tp-site-muted-foreground)
      );
      --primary: var(--tp-light-primary, var(--tp-site-primary));
      --primary-foreground: var(
         --tp-light-primaryForeground,
         var(--tp-site-primary-foreground)
      );
      --secondary: var(--tp-light-secondary, var(--tp-site-secondary));
      --secondary-foreground: var(
         --tp-light-secondaryForeground,
         var(--tp-site-secondary-foreground)
      );
      --accent: var(--tp-light-accent, var(--tp-site-accent));
      --accent-foreground: var(
         --tp-light-accentForeground,
         var(--tp-site-accent-foreground)
      );
      --border: var(--tp-light-border, var(--tp-site-border));
      --input: var(--tp-light-input, var(--tp-site-input));
      --ring: var(--tp-light-ring, var(--tp-site-ring));
      --radius: var(--tp-radius, var(--tp-site-radius));
      font-family: var(--tournament-body-font);
      color: hsl(var(--foreground));
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

   :global(.dark) .tournament-shell {
      --background: var(
         --tp-dark-background,
         var(--tp-light-background, var(--tp-site-background))
      );
      --foreground: var(
         --tp-dark-foreground,
         var(--tp-light-foreground, var(--tp-site-foreground))
      );
      --card: var(--tp-dark-card, var(--tp-light-card, var(--tp-site-card)));
      --card-foreground: var(
         --tp-dark-cardForeground,
         var(--tp-light-cardForeground, var(--tp-site-card-foreground))
      );
      --muted: var(
         --tp-dark-muted,
         var(--tp-light-muted, var(--tp-site-muted))
      );
      --muted-foreground: var(
         --tp-dark-mutedForeground,
         var(--tp-light-mutedForeground, var(--tp-site-muted-foreground))
      );
      --primary: var(
         --tp-dark-primary,
         var(--tp-light-primary, var(--tp-site-primary))
      );
      --primary-foreground: var(
         --tp-dark-primaryForeground,
         var(--tp-light-primaryForeground, var(--tp-site-primary-foreground))
      );
      --secondary: var(
         --tp-dark-secondary,
         var(--tp-light-secondary, var(--tp-site-secondary))
      );
      --secondary-foreground: var(
         --tp-dark-secondaryForeground,
         var(
            --tp-light-secondaryForeground,
            var(--tp-site-secondary-foreground)
         )
      );
      --accent: var(
         --tp-dark-accent,
         var(--tp-light-accent, var(--tp-site-accent))
      );
      --accent-foreground: var(
         --tp-dark-accentForeground,
         var(--tp-light-accentForeground, var(--tp-site-accent-foreground))
      );
      --border: var(
         --tp-dark-border,
         var(--tp-light-border, var(--tp-site-border))
      );
      --input: var(
         --tp-dark-input,
         var(--tp-light-input, var(--tp-site-input))
      );
      --ring: var(--tp-dark-ring, var(--tp-light-ring, var(--tp-site-ring)));
   }

   .prose-content {
      max-width: 100%;
   }
</style>
