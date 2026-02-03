<script lang="ts">
	import { onMount } from 'svelte';
	import KnowledgeBaseManager from './KnowledgeBaseManager.svelte';
	import SessionsList from './SessionsList.svelte';
	import AnalyticsView from './AnalyticsView.svelte';

	let activeTab = $state<'analytics' | 'sessions' | 'knowledge'>('analytics');
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-2">Admin Dashboard</h1>
		<p class="text-muted-foreground">Manage knowledge base, view sessions, and export data</p>
	</div>

	<!-- Tabs -->
	<div class="border-b border-border mb-6">
		<nav class="flex space-x-8">
			<button
				on:click={() => activeTab = 'analytics'}
				class="py-4 px-1 border-b-2 font-medium text-sm {
					activeTab === 'analytics'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-muted-foreground hover:text-foreground'
				}"
			>
				Analytics
			</button>
			<button
				on:click={() => activeTab = 'sessions'}
				class="py-4 px-1 border-b-2 font-medium text-sm {
					activeTab === 'sessions'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-muted-foreground hover:text-foreground'
				}"
			>
				Sessions
			</button>
			<button
				on:click={() => activeTab = 'knowledge'}
				class="py-4 px-1 border-b-2 font-medium text-sm {
					activeTab === 'knowledge'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-muted-foreground hover:text-foreground'
				}"
			>
				Knowledge Base
			</button>
		</nav>
	</div>

	<!-- Tab Content -->
	<div>
		{#if activeTab === 'analytics'}
			<AnalyticsView />
		{:else if activeTab === 'sessions'}
			<SessionsList />
		{:else if activeTab === 'knowledge'}
			<KnowledgeBaseManager />
		{/if}
	</div>
</div>
