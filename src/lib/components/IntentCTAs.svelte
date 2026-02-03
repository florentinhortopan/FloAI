<script lang="ts">
	import type { Intent } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let currentIntent: Intent | null = null;
	export let variant: 'header' | 'default' = 'default'; // 'header' for use in primary header, 'default' for white background

	const dispatch = createEventDispatcher<{ select: Intent }>();

	const intents: Array<{ id: Intent; title: string }> = [
		{
			id: 'hire',
			title: 'Hire Flo'
		},
		{
			id: 'partner',
			title: 'Partner'
		},
		{
			id: 'fun',
			title: 'Just Chat'
		},
		{
			id: 'newsletter',
			title: 'Newsletter'
		}
	];

	function selectIntent(intent: Intent) {
		dispatch('select', intent);
	}
</script>

<!-- High contrast intent buttons - WordPress.com style -->
<div class="flex flex-wrap gap-2 justify-center">
	{#each intents as intent}
		<button
			on:click={() => selectIntent(intent.id)}
			class="px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 border-2 {
				variant === 'header'
					? currentIntent === intent.id
						? 'bg-white text-primary border-white shadow-md'
						: 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
					: currentIntent === intent.id
						? 'bg-primary text-primary-foreground border-primary shadow-md'
						: 'bg-card text-card-foreground border-border hover:border-primary hover:bg-primary/5'
			}"
		>
			{intent.title}
		</button>
	{/each}
</div>
