<script lang="ts">
	import { onMount } from 'svelte';
	import ConversationInterface from '$lib/components/ConversationInterface.svelte';

	let sessionId: string | null = null;

	onMount(() => {
		// Generate session ID for this conversation
		sessionId = crypto.randomUUID();
	});
</script>

<!-- High contrast WordPress.com-inspired design -->
<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<!-- Header with admin link - high contrast -->
		<div class="flex justify-between items-center mb-8 border-b border-border pb-4">
			<h1 class="text-3xl font-bold text-foreground">FloAI</h1>
			<a
				href="/admin"
				class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors shadow-sm hover:shadow-md"
			>
				Admin Dashboard
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
