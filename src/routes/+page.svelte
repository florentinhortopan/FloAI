<script lang="ts">
	import { onMount } from 'svelte';
	import ConversationInterface from '$lib/components/ConversationInterface.svelte';

	let sessionId: string | null = null;

	onMount(() => {
		// Generate session ID for this conversation
		sessionId = crypto.randomUUID();
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
	<div class="container mx-auto px-4 py-8">
		<div class="flex justify-end mb-4">
			<a
				href="/admin"
				class="px-4 py-2 text-sm bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow text-foreground"
			>
				📊 Admin Dashboard
			</a>
		</div>
		<ConversationInterface {sessionId} />
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
