<script lang="ts">
   import { goto, invalidateAll } from "$app/navigation";
   import {
      ArrowUp01Icon,
      Calendar01Icon,
      Home01Icon,
      Mailbox01Icon,
      Search01Icon,
      Settings01Icon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";

   import type { user as User } from "@ota/db/schema";
   import { authClient } from "@ota/auth/client";
   import { Button } from "@ota/ui/components/button/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";
   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   let {
      user,
   }: { user?: Omit<typeof User.$inferSelect, "osuId" | "discordId"> } =
      $props();

   // Menu items.
   const items = [
      {
         title: "Home",
         url: "#",
         icon: Home01Icon,
      },
      {
         title: "Inbox",
         url: "#",
         icon: Mailbox01Icon,
      },
      {
         title: "Calendar",
         url: "#",
         icon: Calendar01Icon,
      },
      {
         title: "Search",
         url: "#",
         icon: Search01Icon,
      },
      {
         title: "Settings",
         url: "#",
         icon: Settings01Icon,
      },
   ];
</script>

<Sidebar.Root collapsible="icon">
   <Sidebar.Content>
      <Sidebar.Group>
         <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
         <Sidebar.GroupContent>
            <Sidebar.Menu>
               {#each items as item (item.title)}
                  <Sidebar.MenuItem>
                     <Sidebar.MenuButton>
                        {#snippet child({ props })}
                           <a href={item.url} {...props}>
                              <HugeiconsIcon icon={item.icon} />
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
      {#if user}
         <Sidebar.Menu>
            <Sidebar.MenuItem>
               <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                     {#snippet child({ props })}
                        <Sidebar.MenuButton
                           {...props}
                           class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                           {user.name}
                           <HugeiconsIcon
                              icon={ArrowUp01Icon}
                              class="ms-auto"
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
                              console.debug("clicked");
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
         <Button
            onclick={async () => {
               await goto("/signup");
            }}
         >
            Create an account
         </Button>
      {/if}
   </Sidebar.Footer>
</Sidebar.Root>
