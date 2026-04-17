<script lang="ts">
   let {
      value = $bindable<Record<string, string>>({}),
   }: {
      value?: Record<string, string>;
   } = $props();

   function handleInput(event: Event) {
      const nextValue = (event.currentTarget as HTMLInputElement).value.trim();
      const nextTheme = { ...value };

      if (nextValue) {
         nextTheme.background = nextValue;
      } else {
         delete nextTheme.background;
      }

      value = nextTheme;
   }
</script>

<label for="background-token">Background</label>
<input
   id="background-token"
   value={value.background ?? ""}
   oninput={handleInput}
/>
