<script lang="ts">
	import type { Message } from '$lib/types';
	import SeguePills from './SeguePills.svelte';
	import { createEventDispatcher } from 'svelte';

	export let message: Message;

	const dispatch = createEventDispatcher<{ segueSelect: string }>();

	function handleSegueSelect(event: CustomEvent<string>) {
		dispatch('segueSelect', event.detail);
	}
</script>

<!-- High contrast message bubbles - WordPress.com style -->
<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4">
	<div
		class="max-w-[80%] rounded-md px-4 py-3 border-2 {
			message.role === 'user'
				? 'bg-primary text-primary-foreground border-primary'
				: 'bg-card text-card-foreground border-border shadow-sm'
		}"
	>
		<p class="whitespace-pre-wrap font-normal leading-relaxed">{message.content}</p>
		
		{#if message.metadata?.matchingRate !== undefined}
			<div class="mt-4 pt-4 border-t-2 border-border/30">
				<div class="flex items-center gap-3 mb-3">
					<span class="text-sm font-semibold">Match Rate:</span>
					<div class="flex-1 bg-muted rounded-full h-3 overflow-hidden border border-border">
						<div
							class="h-full bg-primary transition-all duration-500 rounded-full"
							style="width: {message.metadata.matchingRate}%"
						></div>
					</div>
					<span class="text-sm font-bold min-w-[3rem]">{message.metadata.matchingRate}%</span>
				</div>
				
				{#if message.metadata.strengths && message.metadata.strengths.length > 0}
					<div class="mt-3">
						<p class="text-xs font-semibold mb-2 uppercase tracking-wide">Strengths:</p>
						<ul class="text-sm space-y-1.5">
							{#each message.metadata.strengths as strength}
								<li class="flex items-start gap-2">
									<span class="font-bold text-primary">•</span>
									<span>{strength}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
		
		{#if message.audioUrl}
			<audio controls class="mt-3 w-full rounded-md" src={message.audioUrl}></audio>
		{/if}
		
		<!-- Segue pills for assistant messages -->
		{#if message.role === 'assistant' && message.metadata?.segues && message.metadata.segues.length > 0}
			<SeguePills segues={message.metadata.segues} on:select={handleSegueSelect} />
		{/if}
	</div>
</div>
