<script lang="ts">
   import { m } from "$i18n/messages";
   import { getLocale } from "$i18n/runtime";
   import {
      getTournamentFontStack,
      getTournamentFontStylesheetHref,
      getTournamentThemeStyle,
   } from "$lib/tournament-page";

   import type { PageProps } from "./$types";
   import type {
      TournamentDetailItem,
      TournamentMediaShape,
   } from "./tournament-page.types";
   import TournamentHero from "./tournament-hero.svelte";
   import TournamentSidebar from "./tournament-sidebar.svelte";

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

   const visibilityLabel = $derived.by(() => {
      if (data.tournament.isArchived) {
         return m.common_archived();
      }

      return data.tournament.isPublic ? m.common_public() : m.common_private();
   });

   const description = $derived(
      data.tournament.description ?? m.tournamentPage_descriptionFallback(),
   );

   const scheduleItems = $derived<TournamentDetailItem[]>([
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

   const formatItems = $derived<TournamentDetailItem[]>([
      {
         label: m.tournamentPage_label_teamSize(),
         value: numberFormatter.format(data.tournament.teamSize),
      },
      {
         label: m.tournamentPage_label_lobbySize(),
         value: numberFormatter.format(data.tournament.lobbySize),
      },
      {
         label: m.common_visibility(),
         value: visibilityLabel,
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
      class="min-h-full w-full pt-[clamp(1rem,2vw,1.5rem)] pb-[clamp(2rem,4vw,2.5rem)]"
   >
      <section
         class="tournament-shell px-[clamp(1rem,3vw,3rem)] pt-[clamp(0.25rem,1vw,0.75rem)]"
      >
         <TournamentHero
            {media}
            name={data.tournament.name}
            acronym={data.tournament.acronym}
            {description}
            {status}
            {formattedDuration}
            isStaffView={data.isStaffView}
            isPublic={data.tournament.isPublic}
         />
      </section>

      <div
         class="grid min-h-full gap-[clamp(1.25rem,2.4vw,2rem)] px-[clamp(1rem,3vw,3rem)] pt-[clamp(1.25rem,2.4vw,2rem)] min-[72rem]:grid-cols-[minmax(0,1.65fr)_minmax(19rem,24rem)] min-[72rem]:items-start"
      >
         <section class="tournament-shell min-w-0 space-y-6">
            <section class="space-y-6 px-[clamp(0.2rem,0.8vw,0.6rem)] py-2">
               {#if data.pageContent?.renderedHtml.trim()}
                  <div
                     class="prose prose-a:text-primary prose-strong:text-foreground prose-headings:text-foreground prose-code:text-foreground prose-blockquote:text-foreground prose-img:rounded-[calc(var(--tp-radius-current)+0.2rem)] prose-pre:rounded-[calc(var(--tp-radius-current)+0.1rem)] prose-code:before:hidden prose-code:after:hidden [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_figcaption]:text-muted-foreground [&_td]:text-muted-foreground [&_th]:text-foreground min-h-[75vh] max-w-none [&_h1]:font-[family:var(--tournament-display-font)] [&_h2]:font-[family:var(--tournament-display-font)] [&_h3]:font-[family:var(--tournament-display-font)]"
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
            </section>
         </section>

         <TournamentSidebar
            isPublic={data.tournament.isPublic}
            {scheduleItems}
            {formatItems}
         />
      </div>
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
      --tp-secondary-current: var(--tp-light-secondary, var(--secondary));
      --tp-secondary-foreground-current: var(
         --tp-light-secondaryForeground,
         var(--secondary-foreground)
      );
      --tp-accent-current: var(--tp-light-accent, var(--accent));
      --tp-accent-foreground-current: var(
         --tp-light-accentForeground,
         var(--accent-foreground)
      );
      --tp-border-current: var(--tp-light-border, var(--border));
      --tp-input-current: var(--tp-light-input, var(--input));
      --tp-ring-current: var(--tp-light-ring, var(--ring));
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
      --background: var(--tp-background-current);
      --foreground: var(--tp-foreground-current);
      --card: var(--tp-card-current);
      --card-foreground: var(--tp-card-foreground-current);
      --muted: var(--tp-muted-current);
      --muted-foreground: var(--tp-muted-foreground-current);
      --primary: var(--tp-primary-current);
      --primary-foreground: var(--tp-primary-foreground-current);
      --secondary: var(--tp-secondary-current);
      --secondary-foreground: var(--tp-secondary-foreground-current);
      --accent: var(--tp-accent-current);
      --accent-foreground: var(--tp-accent-foreground-current);
      --border: var(--tp-border-current);
      --input: var(--tp-input-current);
      --ring: var(--tp-ring-current);
      --radius: var(--tp-radius, var(--tp-site-radius));
      font-family: var(--tournament-body-font);
      color: hsl(var(--foreground));
      --tw-prose-body: hsl(var(--muted-foreground));
      --tw-prose-headings: hsl(var(--foreground));
      --tw-prose-lead: hsl(var(--muted-foreground));
      --tw-prose-links: hsl(var(--primary));
      --tw-prose-bold: hsl(var(--foreground));
      --tw-prose-counters: hsl(var(--muted-foreground));
      --tw-prose-bullets: hsl(var(--primary));
      --tw-prose-hr: hsl(var(--border));
      --tw-prose-quotes: hsl(var(--foreground));
      --tw-prose-quote-borders: hsl(var(--border));
      --tw-prose-captions: hsl(var(--muted-foreground));
      --tw-prose-code: hsl(var(--foreground));
      --tw-prose-pre-code: hsl(var(--foreground));
      --tw-prose-pre-bg: hsl(var(--muted));
      --tw-prose-th-borders: hsl(var(--border));
      --tw-prose-td-borders: hsl(var(--border));
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
      --tp-secondary-current: var(
         --tp-dark-secondary,
         var(--tp-light-secondary, var(--secondary))
      );
      --tp-secondary-foreground-current: var(
         --tp-dark-secondaryForeground,
         var(--tp-light-secondaryForeground, var(--secondary-foreground))
      );
      --tp-accent-current: var(
         --tp-dark-accent,
         var(--tp-light-accent, var(--accent))
      );
      --tp-accent-foreground-current: var(
         --tp-dark-accentForeground,
         var(--tp-light-accentForeground, var(--accent-foreground))
      );
      --tp-border-current: var(
         --tp-dark-border,
         var(--tp-light-border, var(--border))
      );
      --tp-input-current: var(
         --tp-dark-input,
         var(--tp-light-input, var(--input))
      );
      --tp-ring-current: var(--tp-dark-ring, var(--tp-light-ring, var(--ring)));
   }
</style>
