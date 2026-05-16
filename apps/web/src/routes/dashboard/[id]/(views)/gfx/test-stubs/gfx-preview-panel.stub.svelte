<script lang="ts">
   let {
      onSave,
      saving = false,
   }: {
      onSave: () => Promise<void>;
      saving?: boolean;
   } = $props();
</script>

<button type="button" onclick={onSave} disabled={saving}>Save changes</button>
