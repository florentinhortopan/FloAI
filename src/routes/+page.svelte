<script lang="ts">
	import { onMount } from 'svelte';
	import IntentSelector from '$lib/components/IntentSelector.svelte';
	import ConversationInterface from '$lib/components/ConversationInterface.svelte';
	import type { Intent } from '$lib/types';

	let selectedIntent: Intent | null = null;
	let sessionId: string | null = null;

	onMount(() => {
		// Generate session ID for this conversation
		sessionId = crypto.randomUUID();
	});

	function handleIntentSelect(intent: Intent) {
		selectedIntent = intent;
	}

	function handleBack() {
		selectedIntent = null;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
	<div class="container mx-auto px-4 py-8">
		{#if !selectedIntent}
			<div class="max-w-4xl mx-auto text-center space-y-8">
				<div class="space-y-4 animate-fade-in">
					<h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						FloAI
					</h1>
					<p class="text-xl text-muted-foreground">
						Your intelligent virtual assistant for job matching and collaboration
					</p>
				</div>

				<IntentSelector on:select={handleIntentSelect} />
			</div>
		{:else}
			<ConversationInterface {selectedIntent} {sessionId} on:back={handleBack} />
		{/if}
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.6s ease-out;
	}
</style>
