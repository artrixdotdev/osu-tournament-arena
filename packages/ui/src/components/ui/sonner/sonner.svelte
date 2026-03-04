<script lang="ts">
   import type { ToasterProps as SonnerProps } from "svelte-sonner";
   import {
      Alert01Icon,
      CancelCircleIcon,
      InformationCircleIcon,
      Loading02Icon,
      Tick02Icon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { userPrefersMode } from "mode-watcher";
   import { Toaster as Sonner } from "svelte-sonner";

   let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
   theme={userPrefersMode.current}
   class="toaster group"
   style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
   {...restProps}
   >{#snippet loadingIcon()}
      <HugeiconsIcon
         icon={Loading02Icon}
         size={16}
         strokeWidth={1.8}
         class="animate-spin"
      />
   {/snippet}
   {#snippet successIcon()}
      <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={1.8} />
   {/snippet}
   {#snippet errorIcon()}
      <HugeiconsIcon icon={CancelCircleIcon} size={16} strokeWidth={1.8} />
   {/snippet}
   {#snippet infoIcon()}
      <HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={1.8} />
   {/snippet}
   {#snippet warningIcon()}
      <HugeiconsIcon icon={Alert01Icon} size={16} strokeWidth={1.8} />
   {/snippet}
</Sonner>
