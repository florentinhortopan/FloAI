<script lang="ts">
	import { onMount } from 'svelte';

	let analytics = $state<any>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/analytics');
			if (!response.ok) throw new Error('Failed to fetch analytics');
			analytics = await response.json();
		} catch (error) {
			console.error('Error loading analytics:', error);
		} finally {
			loading = false;
		}
	});

	async function exportConversations(format: 'json' | 'csv' = 'csv') {
		try {
			const response = await fetch(`/api/admin/export?format=${format}`);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `conversations-${new Date().toISOString()}.${format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Export error:', error);
			alert('Failed to export conversations');
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-12">
		<div class="text-muted-foreground">Loading analytics...</div>
	</div>
{:else if analytics}
	<div class="space-y-6">
		<!-- Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
				<div class="text-sm text-muted-foreground mb-1">Total Conversations</div>
				<div class="text-3xl font-bold">{analytics.overview.totalConversations}</div>
			</div>
			<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
				<div class="text-sm text-muted-foreground mb-1">Total Messages</div>
				<div class="text-3xl font-bold">{analytics.overview.totalMessages}</div>
			</div>
			<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
				<div class="text-sm text-muted-foreground mb-1">Newsletter Subscribers</div>
				<div class="text-3xl font-bold">{analytics.overview.newsletterSubscribers}</div>
			</div>
			<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
				<div class="text-sm text-muted-foreground mb-1">Avg Job Match Rate</div>
				<div class="text-3xl font-bold">
					{analytics.overview.avgJobMatchRate
						? `${Math.round(analytics.overview.avgJobMatchRate)}%`
						: 'N/A'}
				</div>
			</div>
		</div>

		<!-- Intent Breakdown -->
		<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Conversations by Intent</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each Object.entries(analytics.byIntent) as [intent, count]}
					<div class="text-center">
						<div class="text-2xl font-bold">{count}</div>
						<div class="text-sm text-muted-foreground capitalize">{intent}</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Export Actions -->
		<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Export Data</h2>
			<div class="flex gap-4">
				<button
					on:click={() => exportConversations('csv')}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Export All Conversations (CSV)
				</button>
				<button
					on:click={() => exportConversations('json')}
					class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
				>
					Export All Conversations (JSON)
				</button>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
			<div class="space-y-2">
				{#each analytics.recentActivity as activity}
					<div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
						<div>
							<div class="font-medium">{activity.intent}</div>
							<div class="text-sm text-muted-foreground">{activity.firstMessage || 'No messages'}</div>
						</div>
						<div class="text-sm text-muted-foreground">
							{new Date(activity.createdAt).toLocaleDateString()}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
