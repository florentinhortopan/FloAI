<script lang="ts">
	import type { Message } from '$lib/types';

	export let message: Message;
</script>

<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
	<div
		class="max-w-[80%] rounded-2xl px-4 py-3 {
			message.role === 'user'
				? 'bg-blue-600 text-white'
				: 'bg-white dark:bg-slate-800 text-foreground shadow-sm'
		}"
	>
		<p class="whitespace-pre-wrap">{message.content}</p>
		
		{#if message.metadata?.matchingRate !== undefined}
			<div class="mt-4 pt-4 border-t border-border/20">
				<div class="flex items-center space-x-2 mb-2">
					<span class="text-sm font-semibold">Match Rate:</span>
					<div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
						<div
							class="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
							style="width: {message.metadata.matchingRate}%"
						></div>
					</div>
					<span class="text-sm font-bold">{message.metadata.matchingRate}%</span>
				</div>
				
				{#if message.metadata.strengths && message.metadata.strengths.length > 0}
					<div class="mt-2">
						<p class="text-xs font-semibold mb-1">Strengths:</p>
						<ul class="text-xs space-y-1">
							{#each message.metadata.strengths as strength}
								<li class="flex items-start">
									<span class="mr-2">✓</span>
									<span>{strength}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
		
		{#if message.audioUrl}
			<audio controls class="mt-2 w-full" src={message.audioUrl}></audio>
		{/if}
	</div>
</div>
