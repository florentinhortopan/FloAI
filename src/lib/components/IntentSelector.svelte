<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Intent } from '$lib/types';

	const dispatch = createEventDispatcher<{ select: Intent }>();

	const intents: Array<{ id: Intent; title: string; description: string; color: string }> = [
		{
			id: 'hire',
			title: 'Hire Flo',
			description: 'Looking for talent? Let me analyze how Flo matches your job requirements.',
			color: 'from-blue-500 to-cyan-500'
		},
		{
			id: 'partner',
			title: 'Partner for a Project',
			description: 'Explore collaboration opportunities and see how we can work together.',
			color: 'from-purple-500 to-pink-500'
		},
		{
			id: 'fun',
			title: 'Just Having Fun',
			description: 'Let\'s chat! Ask me anything or just have a casual conversation.',
			color: 'from-orange-500 to-red-500'
		},
		{
			id: 'newsletter',
			title: 'Subscribe to Newsletter',
			description: 'Stay updated with Flo\'s latest projects, insights, and updates.',
			color: 'from-green-500 to-emerald-500'
		}
	];

	function selectIntent(intent: Intent) {
		dispatch('select', intent);
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
	{#each intents as intent (intent.id)}
		<button
			on:click={() => selectIntent(intent.id)}
			class="group relative overflow-hidden rounded-2xl bg-card text-card-foreground p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-border"
		>
			<div class="absolute inset-0 bg-gradient-to-br {intent.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
			
			<div class="relative z-10 space-y-4">
				<h3 class="text-2xl font-bold text-foreground">{intent.title}</h3>
				<p class="text-muted-foreground">{intent.description}</p>
				
				<div class="flex items-center text-sm font-semibold text-primary mt-4 group-hover:translate-x-2 transition-transform duration-300">
					Get Started
					<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</div>
		</button>
	{/each}
</div>
