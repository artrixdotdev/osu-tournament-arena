<script lang="ts">
   import {
      CalendarIcon,
      MeetingRoomIcon,
      RankingIcon,
      SquareLock01Icon,
      SquareUnlock01Icon,
      StarIcon,
      UserGroupIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { client } from "$lib/orpc";
   import {
      previewTournamentMarkdown,
      uploadTournamentMarkdownFiles,
   } from "$lib/tournament-content";
   import { TOURNAMENT_FONT_OPTIONS } from "$lib/tournament-theme";
   import {
      formatTournamentDateRange,
      getTournamentFontHref,
      getTournamentInitials,
      getTournamentScopeStyle,
      getTournamentWindowLabel,
      toDateInputValue,
   } from "$lib/tournament-ui";
   import { parseOptionalFloat, parseOptionalInt } from "$lib/utils/number";
   import { toast } from "svelte-sonner";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Checkbox } from "@ota/ui/components/checkbox/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import { MarkdownEditor } from "@ota/ui/components/markdown-editor/index.ts";
   import { Textarea } from "@ota/ui/components/textarea/index.ts";
   import * as Accordion from "@ota/ui/components/accordion/index.ts";

   import CountryMultiSelect from "$lib/components/country-multi-select.svelte";
   import TournamentThemeFields from "$lib/components/tournament-theme-fields.svelte";

   import type {
      TournamentDiscord,
      TournamentThemeColors,
   } from "@ota/db/schema";
   import type { PageData } from "./$types";

   type DashboardData = PageData["dashboard"];
   type TournamentRecord = DashboardData["tournament"];
   type ContentRecord = DashboardData["content"];
   type ScreeningRequirementsRecord = DashboardData["screeningRequirements"];
   type PermissionsRecord = DashboardData["permissions"];

   type IdentityDraft = {
      name: string;
      acronym: string;
      rendition: string;
      description: string;
      logo: string;
   };

   type ScheduleDraft = {
      startDate: string;
      endDate: string;
   };

   type VisibilityDraft = {
      isPublic: boolean;
   };

   type CompetitionDraft = {
      teamSize: string;
      lobbySize: string;
      minimumRank: string;
      maximumRank: string;
      minimumRating: string;
      maximumRating: string;
      allowedCountries: string[];
      useBws: boolean;
      minimumBadges: string;
      bwsExponent: string;
   };

   type DiscordDraft = {
      serverId: string;
      matchResults: string;
      matchPings: string;
      roles: Record<string, string>;
   };

   type ContentDraft = {
      body: string;
      fontFamily: string;
      themeColors: Partial<TournamentThemeColors>;
   };

   const discordRoleOrder = [
      "HOST",
      "ADMIN",
      "POOLER",
      "PLAYTESTER",
      "REFEREE",
      "COMMENTATOR",
      "SPECTATOR",
      "PLAYER",
      "CAPTAIN",
   ] as const;

   let { data }: { data: PageData } = $props();

   let tournament = $state<TournamentRecord>({} as TournamentRecord);
   let content = $state<ContentRecord>({} as ContentRecord);
   let screeningRequirements = $state<ScreeningRequirementsRecord>(null);
   let permissions = $state<PermissionsRecord>({
      canManageDetails: false,
      canManageSchedule: false,
      canManageDiscord: false,
      canManageContent: false,
      canManageArchive: false,
      canManageSettings: false,
      canManageScreening: false,
      canManageVisibility: false,
   });
   let staffRoles = $state<DashboardData["staff"]["roles"]>([]);

   let savingSection = $state<string | null>(null);

   let identityDraft = $state<IdentityDraft>({
      name: "",
      acronym: "",
      rendition: "",
      description: "",
      logo: "",
   });
   let scheduleDraft = $state<ScheduleDraft>({
      startDate: "",
      endDate: "",
   });
   let visibilityDraft = $state<VisibilityDraft>({
      isPublic: false,
   });
   let competitionDraft = $state<CompetitionDraft>({
      teamSize: "",
      lobbySize: "",
      minimumRank: "",
      maximumRank: "",
      minimumRating: "",
      maximumRating: "",
      allowedCountries: [],
      useBws: false,
      minimumBadges: "",
      bwsExponent: "0.9937",
   });
   let discordDraft = $state<DiscordDraft>({
      serverId: "",
      matchResults: "",
      matchPings: "",
      roles: Object.fromEntries(discordRoleOrder.map((role) => [role, ""])),
   });
   let contentDraft = $state<ContentDraft>({
      body: "",
      fontFamily: "",
      themeColors: {},
   });

   $effect(() => {
      tournament = data.dashboard.tournament;
      content = data.dashboard.content;
      screeningRequirements = data.dashboard.screeningRequirements;
      permissions = data.dashboard.permissions;
      staffRoles = data.dashboard.staff.roles;
      identityDraft = createIdentityDraft(tournament);
      scheduleDraft = createScheduleDraft(tournament);
      visibilityDraft = createVisibilityDraft(tournament);
      competitionDraft = createCompetitionDraft(
         tournament,
         screeningRequirements,
      );
      discordDraft = createDiscordDraft(tournament.discord);
      contentDraft = createContentDraft(content);
   });

   const tournamentInitials = $derived(
      getTournamentInitials(tournament.name, tournament.acronym),
   );
   const dateRange = $derived(
      formatTournamentDateRange(tournament.startDate, tournament.endDate),
   );
   const windowLabel = $derived(
      tournament.isArchived
         ? "Archived"
         : getTournamentWindowLabel(tournament.startDate, tournament.endDate),
   );
   const previewFontHref = $derived(
      getTournamentFontHref(contentDraft.fontFamily),
   );
   const previewScopeStyle = $derived(
      getTournamentScopeStyle(
         contentDraft.themeColors,
         contentDraft.fontFamily,
      ),
   );

   function createIdentityDraft(source: typeof tournament): IdentityDraft {
      return {
         name: source.name,
         acronym: source.acronym ?? "",
         rendition: source.rendition?.toString() ?? "",
         description: source.description ?? "",
         logo: source.logo ?? "",
      };
   }

   function createScheduleDraft(source: typeof tournament): ScheduleDraft {
      return {
         startDate: toDateInputValue(source.startDate),
         endDate: toDateInputValue(source.endDate),
      };
   }

   function createVisibilityDraft(source: typeof tournament): VisibilityDraft {
      return {
         isPublic: source.isPublic,
      };
   }

   function createCompetitionDraft(
      source: typeof tournament,
      requirements: typeof screeningRequirements,
   ): CompetitionDraft {
      return {
         teamSize: String(source.teamSize),
         lobbySize: String(source.lobbySize),
         minimumRank: requirements?.minimumRank?.toString() ?? "",
         maximumRank: requirements?.maximumRank?.toString() ?? "",
         minimumRating: requirements?.minimumRating?.toString() ?? "",
         maximumRating: requirements?.maximumRating?.toString() ?? "",
         allowedCountries: requirements?.allowedCountries ?? [],
         useBws: requirements?.useBws ?? false,
         minimumBadges: requirements?.minimumBadges?.toString() ?? "",
         bwsExponent: requirements?.bwsExponent?.toString() ?? "0.9937",
      };
   }

   function createDiscordDraft(
      source: TournamentDiscord | null | undefined,
   ): DiscordDraft {
      return {
         serverId: source?.serverId ?? "",
         matchResults: source?.channels.matchResults ?? "",
         matchPings: source?.channels.matchPings ?? "",
         roles: Object.fromEntries(
            discordRoleOrder.map((role) => [role, source?.roles[role] ?? ""]),
         ),
      };
   }

   function createContentDraft(source: typeof content): ContentDraft {
      return {
         body: source.body,
         fontFamily: source.fontFamily ?? "",
         themeColors: { ...(source.themeColors ?? {}) },
      };
   }

   function signature(value: unknown) {
      return JSON.stringify(value);
   }

   function normalizeOptionalUrl(value: string) {
      const trimmed = value.trim();

      if (!trimmed) {
         return null;
      }

      if (!URL.canParse(trimmed)) {
         throw new Error("Enter a valid URL");
      }

      return trimmed;
   }

   function normalizeDiscordDraft(value: DiscordDraft) {
      const serverId = value.serverId.trim();
      const matchResults = value.matchResults.trim();
      const matchPings = value.matchPings.trim();
      const roles = Object.fromEntries(
         Object.entries(value.roles)
            .map(([key, roleId]) => [key, roleId.trim()])
            .filter(([, roleId]) => roleId),
      );

      if (!serverId && !matchResults && !matchPings && !Object.keys(roles).length) {
         return null;
      }

      if (!serverId || !matchResults || !matchPings) {
         throw new Error("Discord config needs a server and both channel IDs");
      }

      return {
         serverId,
         channels: {
            matchResults,
            matchPings,
         },
         roles,
      };
   }

   async function withSave(section: string, task: () => Promise<void>) {
      if (savingSection) {
         return;
      }

      savingSection = section;

      try {
         await task();
      } catch (error) {
         toast.error(error instanceof Error ? error.message : "Save failed");
      } finally {
         savingSection = null;
      }
   }

   async function saveIdentity() {
      if (!permissions.canManageDetails) {
         return;
      }

      await withSave("identity", async () => {
         if (!identityDraft.name.trim()) {
            throw new Error("Tournament name is required");
         }

         const rendition = parseOptionalInt(identityDraft.rendition);
         if (identityDraft.rendition.trim() && rendition === undefined) {
            throw new Error("Rendition must be a positive integer");
         }

         const result = await client.tournament.updateDetails({
            id: tournament.id,
            name: identityDraft.name.trim(),
            acronym: identityDraft.acronym.trim() || null,
            rendition: rendition ?? null,
            description: identityDraft.description.trim() || null,
            logo: normalizeOptionalUrl(identityDraft.logo),
         });

         if (!result.updated) {
            toast.message("No identity changes to save");
            return;
         }

         tournament = result.tournament;
         identityDraft = createIdentityDraft(tournament);
         scheduleDraft = createScheduleDraft(tournament);
         visibilityDraft = createVisibilityDraft(tournament);
         discordDraft = createDiscordDraft(tournament.discord);
         toast.success("Tournament identity updated");
      });
   }

   async function saveSchedule() {
      if (!permissions.canManageSchedule) {
         return;
      }

      await withSave("schedule", async () => {
         if (!scheduleDraft.startDate || !scheduleDraft.endDate) {
            throw new Error("Start and end dates are required");
         }

         const startDate = new Date(`${scheduleDraft.startDate}T00:00:00.000Z`);
         const endDate = new Date(`${scheduleDraft.endDate}T00:00:00.000Z`);

         if (startDate >= endDate) {
            throw new Error("End date must be after the start date");
         }

         const result = await client.tournament.updateSchedule({
            id: tournament.id,
            startDate,
            endDate,
         });

         if (!result.updated) {
            toast.message("No schedule changes to save");
            return;
         }

         tournament = result.tournament;
         scheduleDraft = createScheduleDraft(tournament);
         toast.success("Schedule updated");
      });
   }

   async function saveVisibility() {
      if (!permissions.canManageVisibility) {
         return;
      }

      await withSave("visibility", async () => {
         const result = await client.tournament.updateVisibility({
            id: tournament.id,
            isPublic: visibilityDraft.isPublic,
         });

         if (!result.updated) {
            toast.message("No visibility changes to save");
            return;
         }

         tournament = result.tournament;
         visibilityDraft = createVisibilityDraft(tournament);
         toast.success(
            tournament.isPublic
               ? "Tournament is now public"
               : "Tournament is now hidden",
         );
      });
   }

   async function saveCompetition() {
      if (!permissions.canManageSettings && !permissions.canManageScreening) {
         return;
      }

      await withSave("competition", async () => {
         const teamSize = parseOptionalInt(competitionDraft.teamSize);
         const lobbySize = parseOptionalInt(competitionDraft.lobbySize);

         if (teamSize === undefined || teamSize <= 0) {
            throw new Error("Team size must be a positive integer");
         }

         if (lobbySize === undefined || lobbySize <= 0) {
            throw new Error("Lobby size must be a positive integer");
         }

         if (lobbySize < teamSize) {
            throw new Error("Lobby size cannot be smaller than team size");
         }

         const minimumRank = parseOptionalInt(competitionDraft.minimumRank);
         const maximumRank = parseOptionalInt(competitionDraft.maximumRank);
         const minimumRating = parseOptionalInt(competitionDraft.minimumRating);
         const maximumRating = parseOptionalInt(competitionDraft.maximumRating);

         if (
            minimumRank !== undefined &&
            maximumRank !== undefined &&
            minimumRank > maximumRank
         ) {
            throw new Error("Maximum rank must be greater than minimum rank");
         }

         if (
            minimumRating !== undefined &&
            maximumRating !== undefined &&
            minimumRating > maximumRating
         ) {
            throw new Error("Maximum rating must be greater than minimum rating");
         }

         const minimumBadges = parseOptionalInt(competitionDraft.minimumBadges);
         const bwsExponent = parseOptionalFloat(competitionDraft.bwsExponent);

         if (competitionDraft.useBws) {
            if (minimumBadges !== undefined && minimumBadges < 0) {
               throw new Error("Minimum badges cannot be negative");
            }

            if (
               bwsExponent === undefined ||
               bwsExponent <= 0 ||
               bwsExponent >= 1
            ) {
               throw new Error("BWS exponent must be between 0 and 1");
            }
         }

         const result = await client.tournament.updateSettingsAndScreening({
            id: tournament.id,
            teamSize,
            lobbySize,
            minimumRank:
               minimumRank ?? ((null as unknown) as number | undefined),
            maximumRank:
               maximumRank ?? ((null as unknown) as number | undefined),
            minimumRating:
               minimumRating ?? ((null as unknown) as number | undefined),
            maximumRating:
               maximumRating ?? ((null as unknown) as number | undefined),
            allowedCountries: competitionDraft.allowedCountries.length
               ? competitionDraft.allowedCountries.map((country) =>
                    country.toUpperCase(),
                 )
               : null,
            useBws: competitionDraft.useBws,
            minimumBadges:
               (competitionDraft.useBws
                  ? (minimumBadges ??
                       ((null as unknown) as number | undefined))
                  : ((null as unknown) as number | undefined)) as
                  | number
                  | undefined,
            bwsExponent: competitionDraft.useBws
               ? (bwsExponent ?? undefined)
               : 0.9937,
         });

         if (!result.updated) {
            toast.message("No competition changes to save");
            return;
         }

         if (result.tournament) {
            tournament = result.tournament;
         }

         if (result.screeningRequirements) {
            screeningRequirements = result.screeningRequirements;
         }

         competitionDraft = createCompetitionDraft(
            tournament,
            screeningRequirements,
         );
         toast.success("Competition settings updated");
      });
   }

   async function saveDiscord() {
      if (!permissions.canManageDiscord) {
         return;
      }

      await withSave("discord", async () => {
         const discord = normalizeDiscordDraft(discordDraft);
         const result = await client.tournament.updateDiscord({
            id: tournament.id,
            discord,
         });

         if (!result.updated) {
            toast.message("No Discord changes to save");
            return;
         }

         tournament = result.tournament;
         discordDraft = createDiscordDraft(tournament.discord);
         toast.success(discord ? "Discord integration updated" : "Discord integration removed");
      });
   }

   async function saveContent() {
      if (!permissions.canManageContent) {
         return;
      }

      await withSave("content", async () => {
         const themeColors = Object.fromEntries(
            Object.entries(contentDraft.themeColors).filter(([, value]) =>
               value?.trim(),
            ),
         );

         const result = await client.tournament.updateContent({
            id: tournament.id,
            body: contentDraft.body,
            fontFamily: contentDraft.fontFamily.trim() || null,
            themeColors: Object.keys(themeColors).length ? themeColors : null,
         });

         if (!result.updated) {
            toast.message("No public page changes to save");
            return;
         }

         content = result.content;
         contentDraft = createContentDraft(content);
         toast.success("Public page updated");
      });
   }

   async function archiveTournament() {
      if (!permissions.canManageArchive || tournament.isArchived) {
         return;
      }

      if (!confirm("Archive this tournament? This marks it read-only.")) {
         return;
      }

      await withSave("archive", async () => {
         await client.tournament.archive({ id: tournament.id });
         tournament = {
            ...tournament,
            isArchived: true,
         };
         visibilityDraft = createVisibilityDraft(tournament);
         toast.success("Tournament archived");
      });
   }
</script>

<svelte:head>
   <title>{tournament.name} Dashboard</title>
   {#if previewFontHref}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
         rel="preconnect"
         href="https://fonts.gstatic.com"
         crossorigin="anonymous"
      />
      <link href={previewFontHref} rel="stylesheet" />
   {/if}
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
   <div class="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="space-y-4 xl:sticky xl:top-6 xl:self-start">
         <section class="rounded-[1.5rem] border bg-card p-5 shadow-xs">
            <div class="flex items-center gap-4">
               {#if tournament.logo?.trim()}
                  <img
                     src={tournament.logo}
                     alt={`${tournament.name} logo`}
                     class="h-16 w-16 rounded-2xl border object-cover"
                  />
               {:else}
                  <div
                     class="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl border text-lg font-semibold"
                  >
                     {tournamentInitials}
                  </div>
               {/if}

               <div class="min-w-0">
                  <p class="text-muted-foreground text-xs font-semibold uppercase tracking-[0.16em]">
                     Tournament dashboard
                  </p>
                  <h1 class="mt-1 text-xl font-semibold tracking-[-0.03em]">
                     {tournament.name}
                  </h1>
                  <p class="text-muted-foreground mt-1 text-sm">{tournament.id}</p>
               </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
               <span class="dashboard-pill">{windowLabel}</span>
               <span class="dashboard-pill">
                  {tournament.isPublic ? "Public" : "Hidden"}
               </span>
               {#if tournament.isArchived}
                  <span class="dashboard-pill">Read-only</span>
               {/if}
            </div>

            <Button
               href={`/tournaments/${tournament.id}`}
               variant="outline"
               class="mt-5 w-full"
            >
               View public page
            </Button>
         </section>

         <section class="rounded-[1.5rem] border bg-card p-5 shadow-xs">
            <p class="text-muted-foreground text-xs font-semibold uppercase tracking-[0.16em]">
               Snapshot
            </p>
            <div class="mt-4 space-y-4 text-sm">
               <div>
                  <p class="text-muted-foreground">Window</p>
                  <p class="mt-1 font-medium">{dateRange}</p>
               </div>
               <div>
                  <p class="text-muted-foreground">Competition</p>
                  <p class="mt-1 font-medium">
                     {tournament.teamSize}v{tournament.teamSize} with {tournament.lobbySize} slots
                  </p>
               </div>
               <div>
                  <p class="text-muted-foreground">Staff roles</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                     {#each staffRoles as role (role)}
                        <span class="dashboard-pill">{role}</span>
                     {/each}
                  </div>
               </div>
            </div>
         </section>
      </aside>

      <div class="space-y-6">
         <section class="rounded-[1.75rem] border bg-card p-6 shadow-xs">
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
               <div class="space-y-3">
                  <p class="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
                     Control room
                  </p>
                  <h2 class="text-[clamp(1.85rem,3vw,3rem)] font-semibold tracking-[-0.04em]">
                     Clean tournament management with public-facing polish built in.
                  </h2>
                  <p class="text-muted-foreground max-w-3xl leading-7">
                     This dashboard separates operations from presentation. Use it to manage event identity, publishing, competitive settings, eligibility, branding, and Discord without touching the public page layout.
                  </p>
               </div>

               <div class="grid gap-3 text-sm">
                  <div class="rounded-2xl border bg-background px-4 py-3">
                     <p class="text-muted-foreground">Public guide</p>
                     <p class="mt-1 font-medium">
                        {content.body.trim() ? "Published" : "Empty"}
                     </p>
                  </div>
                  <div class="rounded-2xl border bg-background px-4 py-3">
                     <p class="text-muted-foreground">Discord</p>
                     <p class="mt-1 font-medium">
                        {tournament.discord ? "Connected" : "Not configured"}
                     </p>
                  </div>
                  <div class="rounded-2xl border bg-background px-4 py-3">
                     <p class="text-muted-foreground">Eligibility</p>
                     <p class="mt-1 font-medium">
                        {screeningRequirements ? "Configured" : "Open"}
                     </p>
                  </div>
               </div>
            </div>
         </section>

         <Accordion.Root
            type="multiple"
            value={["identity", "schedule", "competition", "public-page"]}
            class="space-y-4"
         >
            <Accordion.Item value="identity" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Identity</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Name, acronym, summary copy, and logo.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Tournament name</span>
                        <Input bind:value={identityDraft.name} disabled={!permissions.canManageDetails} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Acronym</span>
                        <Input bind:value={identityDraft.acronym} maxlength={6} disabled={!permissions.canManageDetails} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Rendition</span>
                        <Input bind:value={identityDraft.rendition} inputmode="numeric" disabled={!permissions.canManageDetails} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Logo URL</span>
                        <Input bind:value={identityDraft.logo} type="url" placeholder="https://cdn.example.com/logo.png" disabled={!permissions.canManageDetails} />
                     </label>
                  </div>

                  <label class="mt-4 block space-y-2">
                     <span class="field-label">Description</span>
                     <Textarea
                        bind:value={identityDraft.description}
                        rows={4}
                        placeholder="A concise public summary of the tournament."
                        disabled={!permissions.canManageDetails}
                     />
                  </label>

                  <div class="section-actions">
                     <p class="text-muted-foreground text-sm">
                        {permissions.canManageDetails
                           ? "These fields drive the dashboard header and the public tournament page."
                           : "You can review identity details here, but you do not have permission to edit them."}
                     </p>
                     <Button
                        onclick={saveIdentity}
                        disabled={
                           !permissions.canManageDetails ||
                           savingSection === "identity" ||
                           signature(identityDraft) ===
                              signature(createIdentityDraft(tournament))
                        }
                     >
                        {savingSection === "identity" ? "Saving..." : "Save identity"}
                     </Button>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="schedule" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Schedule and visibility</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Control tournament dates and whether the page is public.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Start date</span>
                        <Input bind:value={scheduleDraft.startDate} type="date" disabled={!permissions.canManageSchedule} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">End date</span>
                        <Input bind:value={scheduleDraft.endDate} type="date" disabled={!permissions.canManageSchedule} />
                     </label>
                  </div>

                  <div class="mt-5 rounded-2xl border bg-background p-4">
                     <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                           <p class="field-label">Public listing</p>
                           <p class="text-muted-foreground mt-1 text-sm">
                              Hidden tournaments stay accessible to staff but disappear from public browsing.
                           </p>
                        </div>
                        <label class="flex items-center gap-3 text-sm font-medium">
                           <Checkbox bind:checked={visibilityDraft.isPublic} disabled={!permissions.canManageVisibility} />
                           Publicly visible
                        </label>
                     </div>
                  </div>

                  <div class="section-actions">
                     <p class="text-muted-foreground text-sm">
                        Schedule updates require admin access. Public visibility requires host access.
                     </p>
                     <div class="flex flex-wrap gap-3">
                        <Button
                           onclick={saveSchedule}
                           variant="outline"
                           disabled={
                              !permissions.canManageSchedule ||
                              savingSection === "schedule" ||
                              signature(scheduleDraft) ===
                                 signature(createScheduleDraft(tournament))
                           }
                        >
                           {savingSection === "schedule" ? "Saving..." : "Save schedule"}
                        </Button>
                        <Button
                           onclick={saveVisibility}
                           disabled={
                              !permissions.canManageVisibility ||
                              savingSection === "visibility" ||
                              signature(visibilityDraft) ===
                                 signature(createVisibilityDraft(tournament))
                           }
                        >
                           {savingSection === "visibility"
                              ? "Saving..."
                              : "Save visibility"}
                        </Button>
                     </div>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="competition" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Competition and eligibility</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Team sizing, rating gates, country limits, and BWS controls.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Team size</span>
                        <Input bind:value={competitionDraft.teamSize} inputmode="numeric" disabled={!permissions.canManageSettings} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Lobby size</span>
                        <Input bind:value={competitionDraft.lobbySize} inputmode="numeric" disabled={!permissions.canManageSettings} />
                     </label>
                  </div>

                  <div class="mt-5 grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Minimum rank</span>
                        <Input bind:value={competitionDraft.minimumRank} inputmode="numeric" disabled={!permissions.canManageScreening} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Maximum rank</span>
                        <Input bind:value={competitionDraft.maximumRank} inputmode="numeric" disabled={!permissions.canManageScreening} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Minimum OTR</span>
                        <Input bind:value={competitionDraft.minimumRating} inputmode="numeric" disabled={!permissions.canManageScreening} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Maximum OTR</span>
                        <Input bind:value={competitionDraft.maximumRating} inputmode="numeric" disabled={!permissions.canManageScreening} />
                     </label>
                  </div>

                  <div class="mt-5 space-y-2">
                     <span class="field-label">Allowed countries</span>
                     <CountryMultiSelect bind:value={competitionDraft.allowedCountries} />
                  </div>

                  <div class="mt-5 rounded-2xl border bg-background p-4">
                     <label class="flex items-center gap-3 text-sm font-medium">
                        <Checkbox bind:checked={competitionDraft.useBws} disabled={!permissions.canManageScreening} />
                        Enable badge weighted seeding
                     </label>

                     {#if competitionDraft.useBws}
                        <div class="mt-4 grid gap-4 md:grid-cols-2">
                           <label class="space-y-2">
                              <span class="field-label">Minimum badges</span>
                              <Input bind:value={competitionDraft.minimumBadges} inputmode="numeric" disabled={!permissions.canManageScreening} />
                           </label>
                           <label class="space-y-2">
                              <span class="field-label">BWS exponent</span>
                              <Input bind:value={competitionDraft.bwsExponent} inputmode="decimal" disabled={!permissions.canManageScreening} />
                           </label>
                        </div>
                     {/if}
                  </div>

                  <div class="section-actions">
                     <p class="text-muted-foreground text-sm">
                        Empty rank and rating fields now clear the saved limits instead of leaving stale values behind.
                     </p>
                     <Button
                        onclick={saveCompetition}
                        disabled={
                           (!permissions.canManageSettings &&
                              !permissions.canManageScreening) ||
                           savingSection === "competition" ||
                           signature(competitionDraft) ===
                              signature(
                                 createCompetitionDraft(
                                    tournament,
                                    screeningRequirements,
                                 ),
                              )
                        }
                     >
                        {savingSection === "competition"
                           ? "Saving..."
                           : "Save competition rules"}
                     </Button>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="public-page" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Public page</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Guide content, typography, and tournament-scoped color tokens.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div
                     class="rounded-[1.5rem] border p-5"
                     style={previewScopeStyle}
                  >
                     <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="space-y-1">
                           <p class="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--t-mutedForeground))]">
                              Preview scope
                           </p>
                           <p class="text-xl font-semibold tracking-[-0.03em]">
                              {tournament.name}
                           </p>
                        </div>
                        <span class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--t-mutedForeground))]">
                           {contentDraft.fontFamily.trim() || "App typography"}
                        </span>
                     </div>
                  </div>

                  <div class="mt-5 grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Google font</span>
                        <select
                           class="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
                           bind:value={contentDraft.fontFamily}
                           disabled={!permissions.canManageContent}
                        >
                           <option value="">Use app default</option>
                           {#each TOURNAMENT_FONT_OPTIONS as font (font)}
                              <option value={font}>{font}</option>
                           {/each}
                        </select>
                     </label>
                  </div>

                  <div class="mt-5">
                     <TournamentThemeFields
                        bind:value={contentDraft.themeColors}
                        disabled={!permissions.canManageContent}
                     />
                  </div>

                  <div class="mt-5">
                     <MarkdownEditor
                        bind:value={contentDraft.body}
                        previewHtml={content.renderedBody}
                        placeholder="Publish rules, registration notes, schedule detail, and format specifics here."
                        previewPlaceholder="Public page preview"
                        writeLabel="Write"
                        previewLabel="Preview"
                        uploadLabel="Upload"
                        dropLabel="Drop images, video, or audio files here"
                        onPreviewRequest={previewTournamentMarkdown}
                        onUploadFiles={async ({ files }: { files: File[] }) =>
                           await uploadTournamentMarkdownFiles(tournament.id, files)}
                        disabled={!permissions.canManageContent || savingSection === "content"}
                     />
                  </div>

                  <div class="section-actions">
                     <p class="text-muted-foreground text-sm">
                        This content feeds the accordion-based public tournament page.
                     </p>
                     <Button
                        onclick={saveContent}
                        disabled={
                           !permissions.canManageContent ||
                           savingSection === "content" ||
                           signature(contentDraft) ===
                              signature(createContentDraft(content))
                        }
                     >
                        {savingSection === "content" ? "Saving..." : "Save public page"}
                     </Button>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="discord" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Discord integration</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Guild, announcement channels, and tournament role mapping.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="grid gap-4 md:grid-cols-2">
                     <label class="space-y-2">
                        <span class="field-label">Server ID</span>
                        <Input bind:value={discordDraft.serverId} disabled={!permissions.canManageDiscord} />
                     </label>
                     <label class="space-y-2">
                        <span class="field-label">Match results channel</span>
                        <Input bind:value={discordDraft.matchResults} disabled={!permissions.canManageDiscord} />
                     </label>
                     <label class="space-y-2 md:col-span-2">
                        <span class="field-label">Match pings channel</span>
                        <Input bind:value={discordDraft.matchPings} disabled={!permissions.canManageDiscord} />
                     </label>
                  </div>

                  <div class="mt-5 grid gap-4 md:grid-cols-2">
                     {#each discordRoleOrder as role (role)}
                        <label class="space-y-2">
                           <span class="field-label">{role} role ID</span>
                           <Input bind:value={discordDraft.roles[role]} disabled={!permissions.canManageDiscord} />
                        </label>
                     {/each}
                  </div>

                  <div class="section-actions">
                     <p class="text-muted-foreground text-sm">
                        Leave every field empty to remove the Discord integration entirely.
                     </p>
                     <Button
                        onclick={saveDiscord}
                        disabled={
                           !permissions.canManageDiscord ||
                           savingSection === "discord" ||
                           signature(discordDraft) ===
                              signature(createDiscordDraft(tournament.discord))
                        }
                     >
                        {savingSection === "discord" ? "Saving..." : "Save Discord config"}
                     </Button>
                  </div>
               </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="danger" class="rounded-[1.5rem] border bg-card px-6 shadow-xs">
               <Accordion.Trigger class="py-5 text-base font-semibold no-underline hover:no-underline">
                  <div class="space-y-1">
                     <p>Archive</p>
                     <p class="text-muted-foreground text-sm font-normal">
                        Freeze the tournament once active management is done.
                     </p>
                  </div>
               </Accordion.Trigger>
               <Accordion.Content class="pb-6">
                  <div class="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                     <p class="font-medium">Archive tournament</p>
                     <p class="text-muted-foreground mt-1 text-sm leading-6">
                        Archiving marks the tournament read-only. It stays visible, but it should no longer be treated as an active workflow.
                     </p>
                     <div class="mt-4">
                        <Button
                           variant="destructive"
                           onclick={archiveTournament}
                           disabled={
                              !permissions.canManageArchive ||
                              tournament.isArchived ||
                              savingSection === "archive"
                           }
                        >
                           {tournament.isArchived
                              ? "Already archived"
                              : savingSection === "archive"
                                ? "Archiving..."
                                : "Archive tournament"}
                        </Button>
                     </div>
                  </div>
               </Accordion.Content>
            </Accordion.Item>
         </Accordion.Root>
      </div>
   </div>
</div>

<style>
   .dashboard-pill {
      border: 1px solid hsl(var(--border));
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: hsl(var(--background));
      color: hsl(var(--muted-foreground));
   }

   .field-label {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: hsl(var(--muted-foreground));
   }

   .section-actions {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.25rem;
      flex-wrap: wrap;
   }
</style>
