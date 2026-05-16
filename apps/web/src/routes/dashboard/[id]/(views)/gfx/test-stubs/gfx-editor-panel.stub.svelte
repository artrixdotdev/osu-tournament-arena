<script lang="ts">
   let {
      body = $bindable(""),
   }: {
      body: string;
   } = $props();
</script>

<label>
   Body
   <input bind:value={body} />
</label>
