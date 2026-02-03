<script lang="ts">
	import { onMount } from 'svelte';

	let sessions: any[] = [];
	let loading = true;
	let page = 1;
	let totalPages = 1;
	let intentFilter = '';

	onMount(() => {
		loadSessions();
	});

	async function loadSessions() {
		loading = true;
		try {
			const url = `/api/admin/sessions?page=${page}&limit=20${intentFilter ? `&intent=${intentFilter}` : ''}`;
			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch sessions');
			const data = await response.json();
			sessions = data.sessions;
			totalPages = data.pagination.totalPages;
		} catch (error) {
			console.error('Error loading sessions:', error);
		} finally {
			loading = false;
		}
	}

	async function exportSession(sessionId: string) {
		try {
			const response = await fetch(`/api/admin/export?sessionId=${sessionId}&format=csv`);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `conversation-${sessionId}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Export error:', error);
			alert('Failed to export session');
		}
	}

	$: if (page || intentFilter) {
		loadSessions();
	}
</script>

<div class="space-y-4">
	<!-- Filters -->
	<div class="flex gap-4 items-center">
		<select
			bind:value={intentFilter}
			class="px-4 py-2 border border-input rounded-lg bg-background"
		>
			<option value="">All Intents</option>
			<option value="hire">Hire</option>
			<option value="partner">Partner</option>
			<option value="fun">Fun</option>
			<option value="newsletter">Newsletter</option>
		</select>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading sessions...</div>
		</div>
	{:else}
		<!-- Sessions Table -->
		<div class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
			<table class="w-full">
				<thead class="bg-slate-100 dark:bg-slate-700">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Session ID</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Intent</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Messages</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Duration</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Match Rate</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each sessions as session}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-700">
							<td class="px-6 py-4 text-sm font-mono">{session.sessionId.substring(0, 8)}...</td>
							<td class="px-6 py-4 text-sm capitalize">{session.intent}</td>
							<td class="px-6 py-4 text-sm">{session.messageCount}</td>
							<td class="px-6 py-4 text-sm">{Math.floor(session.duration / 60)}m {session.duration % 60}s</td>
							<td class="px-6 py-4 text-sm">
								{session.jobMatchRate ? `${Math.round(session.jobMatchRate)}%` : '-'}
							</td>
							<td class="px-6 py-4 text-sm">{new Date(session.createdAt).toLocaleDateString()}</td>
							<td class="px-6 py-4 text-sm">
								<button
									on:click={() => exportSession(session.sessionId)}
									class="text-blue-600 hover:text-blue-800"
								>
									Export
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-center gap-2">
				<button
					on:click={() => {
						page = Math.max(1, page - 1);
					}}
					disabled={page === 1}
					class="px-4 py-2 border rounded-lg disabled:opacity-50"
				>
					Previous
				</button>
				<span class="px-4 py-2">Page {page} of {totalPages}</span>
				<button
					on:click={() => {
						page = Math.min(totalPages, page + 1);
					}}
					disabled={page === totalPages}
					class="px-4 py-2 border rounded-lg disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>
