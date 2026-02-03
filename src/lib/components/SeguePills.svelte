<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let segues: string[] = [];

	const dispatch = createEventDispatcher<{ select: string }>();

	function selectSegue(segue: string) {
		dispatch('select', segue);
	}
</script>

{#if segues && segues.length > 0}
	<div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
		{#each segues as segue}
			<button
				on:click={() => selectSegue(segue)}
				class="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer"
			>
				{segue}
			</button>
		{/each}
	</div>
{/if}
