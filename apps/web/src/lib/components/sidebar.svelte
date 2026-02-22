<script lang="ts">
   import { invalidateAll } from "$app/navigation";
   import { page } from "$app/state";
   import {
      ArrowUp01Icon,
      Award01Icon,
      BookOpen01Icon,
      Calendar01Icon,
      Clock01Icon,
      Compass01Icon,
      Home01Icon,
      LoginIcon,
      Message01Icon,
      Search01Icon,
      Settings01Icon,
      UserGroupIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import type { user as User } from "@ota/db/schema";
   import { authClient } from "@ota/auth/client";
   import * as Avatar from "@ota/ui/components/avatar/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";
   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   import type { IconSvgElement } from "@hugeicons/svelte";

   let {
      user,
   }: { user: Omit<typeof User.$inferSelect, "osuId" | "discordId"> | null } =
      $props();

   const sidebar = Sidebar.useSidebar();

   const mainItems = [
      {
         title: "Home",
         url: "/",
         icon: Home01Icon,
      },
      {
         title: "Schedule",
         url: "/schedule",
         icon: Calendar01Icon,
      },
      {
         title: "Browse",
         url: "/browse",
         icon: Compass01Icon,
      },
   ] as const;

   const contentItems = [
      {
         title: "Tournaments",
         url: "/tournaments",
         icon: Award01Icon,
      },
      {
         title: "Teams",
         url: "/teams",
         icon: UserGroupIcon,
      },
      {
         title: "Players",
         url: "/players",
         icon: Search01Icon,
      },
   ] as const;

   const activityItems = [
      {
         title: "My Library",
         url: "/library",
         icon: BookOpen01Icon,
      },
      {
         title: "History",
         url: "/history",
         icon: Clock01Icon,
      },
      {
         title: "Forums",
         url: "/forums",
         icon: Message01Icon,
      },
   ] as const;
</script>

{#snippet menuItem({
   url,
   icon,
   title,
   strokeWidth = 1.5,
}: {
   url: string;
   icon: IconSvgElement;
   title: string;
   strokeWidth?: number;
})}
   {@const isActive =
      page.url.pathname === "/"
         ? url === "/"
         : url.startsWith(page.url.pathname)}

   <Sidebar.MenuItem>
      <Sidebar.MenuButton {isActive} tooltipContent={title}>
         {#snippet child({ props }: { props?: Record<string, unknown> })}
            <a href={url} {...props}>
               <HugeiconsIcon {icon} size={20} {strokeWidth} />
               <span>{title}</span>
            </a>
         {/snippet}
      </Sidebar.MenuButton>
   </Sidebar.MenuItem>
{/snippet}

<Sidebar.Root collapsible="icon">
   <Sidebar.Content>
      <!-- Main navigation -->
      <Sidebar.Group>
         <Sidebar.GroupContent>
            <Sidebar.Menu>
               {#each mainItems as item (item.title)}
                  {@render menuItem({
                     url: item.url,
                     icon: item.icon,
                     title: item.title,
                  })}
               {/each}
            </Sidebar.Menu>
         </Sidebar.GroupContent>
      </Sidebar.Group>

      <!-- Content section -->
      <Sidebar.Group>
         <Sidebar.GroupLabel
            class="text-[10px] tracking-widest uppercase opacity-50"
         >
            Content
         </Sidebar.GroupLabel>
         <Sidebar.GroupContent>
            <Sidebar.Menu>
               {#each contentItems as item (item.title)}
                  {@render menuItem({
                     url: item.url,
                     icon: item.icon,
                     title: item.title,
                  })}
               {/each}
            </Sidebar.Menu>
         </Sidebar.GroupContent>
      </Sidebar.Group>

      <!-- My Activity section -->
      <Sidebar.Group>
         <Sidebar.GroupLabel
            class="text-[10px] tracking-widest uppercase opacity-50"
         >
            My Activity
         </Sidebar.GroupLabel>
         <Sidebar.GroupContent>
            <Sidebar.Menu>
               {#each activityItems as item (item.title)}
                  {@render menuItem({
                     url: item.url,
                     icon: item.icon,
                     title: item.title,
                  })}
               {/each}
            </Sidebar.Menu>
         </Sidebar.GroupContent>
      </Sidebar.Group>
   </Sidebar.Content>

   <Sidebar.Footer>
      <Sidebar.Menu>
         {@render menuItem({
            url: "/settings",
            icon: Settings01Icon,
            title: "Settings",
         })}
      </Sidebar.Menu>

      {#if user}
         <Sidebar.Menu class="mb-1">
            <Sidebar.MenuItem>
               <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                     {#snippet child({
                        props,
                     }: {
                        props?: Record<string, unknown>;
                     })}
                        <Sidebar.MenuButton
                           {...props}
                           size="lg"
                           class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                           <Avatar.Root>
                              <Avatar.Image src={user.image} alt={user.name} />
                              <Avatar.Fallback>
                                 {user.name.charAt(0)}
                              </Avatar.Fallback>
                           </Avatar.Root>
                           {#if sidebar.state === "expanded"}
                              <div class="flex flex-col gap-0.5 leading-none">
                                 <span class="text-sm font-medium">
                                    {user.name}
                                 </span>
                              </div>
                           {/if}
                           <HugeiconsIcon
                              icon={ArrowUp01Icon}
                              class="ms-auto"
                              size={20}
                           />
                        </Sidebar.MenuButton>
                     {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                     side="top"
                     class="w-(--bits-dropdown-menu-anchor-width)"
                  >
                     <DropdownMenu.Item
                        onSelect={async () => {
                           await authClient.signOut();
                           await invalidateAll();
                        }}
                     >
                        Sign out
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu.Root>
            </Sidebar.MenuItem>
         </Sidebar.Menu>
      {:else}
         <Sidebar.Menu>
            {@render menuItem({
               url: "/signup",
               icon: LoginIcon,
               title: "Sign up",
               strokeWidth: 1.5,
            })}
         </Sidebar.Menu>
      {/if}
   </Sidebar.Footer>
</Sidebar.Root>
