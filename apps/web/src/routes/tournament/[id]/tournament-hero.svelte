<script lang="ts">
   import { m } from "$i18n/messages";

   import {
      Avatar,
      AvatarFallback,
      AvatarImage,
   } from "@ota/ui/components/avatar/index.ts";
   import { Badge } from "@ota/ui/components/badge/index.ts";

   import type { TournamentMediaShape } from "./tournament-page.types";

   interface Props {
      media: TournamentMediaShape;
      name: string;
      acronym?: string | null;
      description: string;
      status: string;
      formattedDuration: string;
      isStaffView: boolean;
      isPublic: boolean;
   }

   let {
      media,
      name,
      acronym = null,
      description,
      status,
      formattedDuration,
      isStaffView,
      isPublic,
   }: Props = $props();

   const bannerStyle = $derived.by(() => {
      if (!media.bannerUrl) {
         return "";
      }

      return `background-image: linear-gradient(180deg, rgb(12 10 18 / 0.08) 0%, rgb(12 10 18 / 0.55) 25%, var(--background) 100%), url(${media.bannerUrl});`;
   });
</script>

<section class="space-y-5">
   <div
      class="bg-card relative isolate min-h-[clamp(20rem,46vw,30rem)] overflow-hidden rounded-3xl"
      style={bannerStyle}
      style:background-size="cover"
      style:background-position="center"
   >
      {#if !media.bannerUrl}
         <div
            class="from-primary/24 via-secondary/14 to-background absolute inset-0 bg-gradient-to-br"
            aria-hidden="true"
         ></div>
      {/if}

      <div
         class="relative flex min-h-[inherit] items-end p-[clamp(1.25rem,3.2vw,2.75rem)]"
      >
         <div class="w-full max-w-[44rem] space-y-5">
            <div class="flex flex-wrap items-center gap-2">
               <Badge variant="secondary">{status}</Badge>
               <Badge>{formattedDuration}</Badge>
               {#if isStaffView && !isPublic}
                  <Badge>{m.common_private()}</Badge>
               {/if}
            </div>

            <div
               class="grid items-end gap-5 min-[42rem]:grid-cols-[auto_minmax(0,1fr)]"
            >
               <Avatar
                  class="border-border/36 bg-card/84 size-[clamp(5.75rem,10vw,8rem)] rounded-2xl border shadow-lg backdrop-blur-[14px]"
               >
                  <AvatarImage
                     src={media.iconUrl ?? media.logo ?? undefined}
                     alt={m.tournamentPage_iconAlt({ name })}
                     class="object-cover"
                  />
                  <AvatarFallback
                     class="rounded-2xl text-xl font-semibold uppercase sm:text-2xl"
                  >
                     {acronym ?? name.slice(0, 2)}
                  </AvatarFallback>
               </Avatar>

               <div class="space-y-3">
                  <h1
                     class="text-card-foreground text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.94] font-[family:var(--tournament-display-font)] font-semibold tracking-[-0.05em] [text-wrap:balance]"
                  >
                     {name}
                  </h1>
                  <p
                     class="text-muted-foreground max-w-[42rem] text-[clamp(0.98rem,1.5vw,1.15rem)] leading-7"
                  >
                     {description}
                  </p>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>
