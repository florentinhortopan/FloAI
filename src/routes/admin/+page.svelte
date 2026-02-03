<script lang="ts">
	import { onMount } from 'svelte';
	import AdminDashboard from '$lib/components/AdminDashboard.svelte';

	let loading = true;
	let error: string | null = null;

	onMount(() => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Admin Dashboard - FloAI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-muted-foreground">Loading...</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-red-500">{error}</div>
		</div>
	{:else}
		<AdminDashboard />
	{/if}
</div>
