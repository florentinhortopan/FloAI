<script lang="ts">
	import { onMount } from 'svelte';

	let documents: any[] = [];
	let loading = true;
	let showForm = false;
	let editingDoc: any = null;

	let formTitle = '';
	let formContent = '';
	let formCategory = '';

	onMount(() => {
		loadDocuments();
	});

	async function loadDocuments() {
		loading = true;
		try {
			const response = await fetch('/api/admin/knowledge');
			if (!response.ok) throw new Error('Failed to fetch documents');
			const data = await response.json();
			documents = data.documents;
		} catch (error) {
			console.error('Error loading documents:', error);
		} finally {
			loading = false;
		}
	}

	async function saveDocument() {
		try {
			const url = editingDoc ? '/api/admin/knowledge' : '/api/admin/knowledge';
			const method = editingDoc ? 'PUT' : 'POST';
			const body = editingDoc
				? { id: editingDoc.id, title: formTitle, content: formContent, category: formCategory }
				: { title: formTitle, content: formContent, category: formCategory };

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!response.ok) throw new Error('Failed to save document');

			formTitle = '';
			formContent = '';
			formCategory = '';
			editingDoc = null;
			showForm = false;
			await loadDocuments();
		} catch (error) {
			console.error('Error saving document:', error);
			alert('Failed to save document');
		}
	}

	async function deleteDocument(id: string) {
		if (!confirm('Are you sure you want to delete this document?')) return;

		try {
			const response = await fetch('/api/admin/knowledge', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});

			if (!response.ok) throw new Error('Failed to delete document');
			await loadDocuments();
		} catch (error) {
			console.error('Error deleting document:', error);
			alert('Failed to delete document');
		}
	}

	function editDocument(doc: any) {
		editingDoc = doc;
		formTitle = doc.title;
		formContent = doc.content;
		formCategory = doc.category || '';
		showForm = true;
	}

	function cancelEdit() {
		editingDoc = null;
		formTitle = '';
		formContent = '';
		formCategory = '';
		showForm = false;
	}
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-semibold">Knowledge Base Documents</h2>
		<button
			on:click={() => {
				showForm = true;
				editingDoc = null;
			}}
			class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
		>
			Add Document
		</button>
	</div>

	{#if showForm}
		<div class="bg-card text-card-foreground p-6 rounded-lg shadow border border-border">
			<h3 class="text-xl font-semibold mb-4">{editingDoc ? 'Edit' : 'Add'} Document</h3>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium mb-2">Title</label>
					<input
						type="text"
						bind:value={formTitle}
						class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						placeholder="Document title"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Category</label>
					<input
						type="text"
						bind:value={formCategory}
						class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						placeholder="e.g., guidelines, about, skills"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-2">Content</label>
					<textarea
						bind:value={formContent}
						rows="10"
						class="w-full px-4 py-2 border border-input rounded-lg bg-background"
						placeholder="Document content (this will be used to guide Flo's responses)"
					></textarea>
				</div>
				<div class="flex gap-2">
					<button
						on:click={saveDocument}
						class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
					>
						Save
					</button>
					<button
						on:click={cancelEdit}
						class="px-4 py-2 border border-input rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading documents...</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each documents as doc}
				<div class="bg-card text-card-foreground p-6 rounded-lg shadow border border-border">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h3 class="text-lg font-semibold">{doc.title}</h3>
							{#if doc.category}
								<span class="text-sm text-muted-foreground">Category: {doc.category}</span>
							{/if}
						</div>
						<div class="flex gap-2">
							<button
								on:click={() => editDocument(doc)}
								class="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary-hover"
							>
								Edit
							</button>
							<button
								on:click={() => deleteDocument(doc.id)}
								class="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:opacity-90"
							>
								Delete
							</button>
						</div>
					</div>
					<p class="text-muted-foreground mt-2">{doc.content.substring(0, 200)}...</p>
				</div>
			{:else}
				<div class="text-center py-12 text-muted-foreground">
					No documents yet. Add your first document to guide Flo's responses!
				</div>
			{/each}
		</div>
	{/if}
</div>
