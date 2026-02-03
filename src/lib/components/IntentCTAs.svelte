<script lang="ts">
	import type { Intent } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let currentIntent: Intent | null = null;

	const dispatch = createEventDispatcher<{ select: Intent }>();

	const intents: Array<{ id: Intent; title: string; icon: string; color: string }> = [
		{
			id: 'hire',
			title: 'Hire Flo',
			icon: '💼',
			color: 'from-blue-500 to-cyan-500'
		},
		{
			id: 'partner',
			title: 'Partner',
			icon: '🤝',
			color: 'from-purple-500 to-pink-500'
		},
		{
			id: 'fun',
			title: 'Just Chat',
			icon: '🎉',
			color: 'from-orange-500 to-red-500'
		},
		{
			id: 'newsletter',
			title: 'Newsletter',
			icon: '📧',
			color: 'from-green-500 to-emerald-500'
		}
	];

	function selectIntent(intent: Intent) {
		dispatch('select', intent);
	}
</script>

<div class="flex flex-wrap gap-2 justify-center">
	{#each intents as intent}
		<button
			on:click={() => selectIntent(intent.id)}
			class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 {
				currentIntent === intent.id
					? 'bg-gradient-to-r ' + intent.color + ' text-white shadow-lg'
					: 'bg-white dark:bg-slate-800 text-foreground border border-border hover:shadow-md'
			}"
		>
			<span class="mr-2">{intent.icon}</span>
			{intent.title}
		</button>
	{/each}
</div>
