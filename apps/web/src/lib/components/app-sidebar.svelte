<script lang="ts">
   import { invalidateAll } from "$app/navigation";
   import {
      ArrowUp01Icon,
      Award01Icon,
      BookOpen01Icon,
      Calendar01Icon,
      Clock01Icon,
      Compass01Icon,
      Home01Icon,
      LoginIcon,
      Menu01Icon,
      Message01Icon,
      Search01Icon,
      Settings01Icon,
      SidebarLeft01Icon,
      UserGroupIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import type { user as User } from "@ota/db/schema";
   import { authClient } from "@ota/auth/client";
   import * as Avatar from "@ota/ui/components/avatar/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";
   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   let {
      user,
   }: { user?: Omit<typeof User.$inferSelect, "osuId" | "discordId"> } =
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
   ];

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
   ];

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
   ];
</script>

<Sidebar.Root collapsible="icon">
   <!-- Sidebar trigger at top — hamburger when expanded, sidebar icon when collapsed -->
   <Sidebar.Header class="p-2">
      <Sidebar.Menu>
         <Sidebar.MenuItem>
            <Sidebar.MenuButton
               onclick={() => sidebar.toggle()}
               tooltipContent="Toggle sidebar"
            >
               {#if sidebar.state === "expanded"}
                  <HugeiconsIcon
                     icon={Menu01Icon}
                     size={18}
                     strokeWidth={1.5}
                  />
               {:else}
                  <HugeiconsIcon
                     icon={SidebarLeft01Icon}
                     size={18}
                     strokeWidth={1.5}
                  />
               {/if}
               <span>Menu</span>
            </Sidebar.MenuButton>
         </Sidebar.MenuItem>
      </Sidebar.Menu>
   </Sidebar.Header>

   <Sidebar.Content>
      <!-- Main navigation -->
      <Sidebar.Group>
         <Sidebar.GroupContent>
            <Sidebar.Menu>
               {#each mainItems as item (item.title)}
                  <Sidebar.MenuItem>
                     <Sidebar.MenuButton tooltipContent={item.title}>
                        {#snippet child({ props })}
                           <a href={item.url} {...props}>
                              <HugeiconsIcon
                                 icon={item.icon}
                                 size={18}
                                 strokeWidth={1.5}
                              />
                              <span>{item.title}</span>
                           </a>
                        {/snippet}
                     </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
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
                  <Sidebar.MenuItem>
                     <Sidebar.MenuButton tooltipContent={item.title}>
                        {#snippet child({ props })}
                           <a href={item.url} {...props}>
                              <HugeiconsIcon
                                 icon={item.icon}
                                 size={18}
                                 strokeWidth={1.5}
                              />
                              <span>{item.title}</span>
                           </a>
                        {/snippet}
                     </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
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
                  <Sidebar.MenuItem>
                     <Sidebar.MenuButton tooltipContent={item.title}>
                        {#snippet child({ props })}
                           <a href={item.url} {...props}>
                              <HugeiconsIcon
                                 icon={item.icon}
                                 size={18}
                                 strokeWidth={1.5}
                              />
                              <span>{item.title}</span>
                           </a>
                        {/snippet}
                     </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
               {/each}
            </Sidebar.Menu>
         </Sidebar.GroupContent>
      </Sidebar.Group>
   </Sidebar.Content>

   <Sidebar.Footer>
      <Sidebar.Menu>
         <Sidebar.MenuItem>
            <Sidebar.MenuButton tooltipContent="Settings">
               {#snippet child({ props })}
                  <a href="/settings" {...props}>
                     <HugeiconsIcon
                        icon={Settings01Icon}
                        size={18}
                        strokeWidth={1.5}
                     />
                     <span>Settings</span>
                  </a>
               {/snippet}
            </Sidebar.MenuButton>
         </Sidebar.MenuItem>
      </Sidebar.Menu>

      {#if user}
         <Sidebar.Menu>
            <Sidebar.MenuItem>
               <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                     {#snippet child({ props })}
                        <Sidebar.MenuButton
                           {...props}
                           size="lg"
                           class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                           <Avatar.Root>
                              <Avatar.Image src={user.image} alt={user.name} />
                              <Avatar.Fallback
                                 >{user.name.charAt(0)}</Avatar.Fallback
                              >
                           </Avatar.Root>
                           {#if sidebar.state === "expanded"}
                              <div class="flex flex-col gap-0.5 leading-none">
                                 <span class="text-sm font-medium"
                                    >{user.name}</span
                                 >
                              </div>
                           {/if}
                           <HugeiconsIcon
                              icon={ArrowUp01Icon}
                              class="ms-auto"
                              size={16}
                           />
                        </Sidebar.MenuButton>
                     {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                     side="top"
                     class="w-(--bits-dropdown-menu-anchor-width)"
                  >
                     <DropdownMenu.Item>
                        <button
                           onclick={async () => {
                              await authClient.signOut();
                              await invalidateAll();
                           }}
                        >
                           Sign out
                        </button>
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu.Root>
            </Sidebar.MenuItem>
         </Sidebar.Menu>
      {:else}
         <Sidebar.Menu>
            <Sidebar.MenuItem>
               <Sidebar.MenuButton tooltipContent="Sign up">
                  {#snippet child({ props })}
                     <a href="/signup" {...props}>
                        <HugeiconsIcon size={18} icon={LoginIcon} />
                        <span>Sign up</span>
                     </a>
                  {/snippet}
               </Sidebar.MenuButton>
            </Sidebar.MenuItem>
         </Sidebar.Menu>
      {/if}
   </Sidebar.Footer>
</Sidebar.Root>
