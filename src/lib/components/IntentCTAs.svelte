<script lang="ts">
	import type { Intent } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let currentIntent: Intent | null = null;

	const dispatch = createEventDispatcher<{ select: Intent }>();

	const intents: Array<{ id: Intent; title: string; icon: string }> = [
		{
			id: 'hire',
			title: 'Hire Flo',
			icon: '💼'
		},
		{
			id: 'partner',
			title: 'Partner',
			icon: '🤝'
		},
		{
			id: 'fun',
			title: 'Just Chat',
			icon: '🎉'
		},
		{
			id: 'newsletter',
			title: 'Newsletter',
			icon: '📧'
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
				currentIntent === intent.id
					? 'bg-primary text-primary-foreground border-primary shadow-md'
					: 'bg-card text-card-foreground border-border hover:border-primary hover:bg-primary/5'
			}"
		>
			<span class="mr-2">{intent.icon}</span>
			{intent.title}
		</button>
	{/each}
</div>
