<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let isListening = false;
	export let disabled = false;

	const dispatch = createEventDispatcher();
</script>

<div class="flex items-center space-x-2">
	<button
		on:click={() => dispatch('toggle')}
		disabled={disabled}
		class="p-3 rounded-lg {
			isListening
				? 'bg-red-500 hover:bg-red-600 text-white'
				: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
		} transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		aria-label={isListening ? 'Stop listening' : 'Start voice input'}
	>
		<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
			{#if isListening}
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			{:else}
				<path
					fill-rule="evenodd"
					d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
					clip-rule="evenodd"
				/>
			{/if}
		</svg>
	</button>
	
	<button
		on:click={() => dispatch('send')}
		disabled={disabled}
		class="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		aria-label="Send message"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
		</svg>
	</button>
</div>
