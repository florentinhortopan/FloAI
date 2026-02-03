import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	storeKnowledgeDocument,
	getAllKnowledgeDocuments,
	deleteKnowledgeDocument,
	updateKnowledgeDocument
} from '$lib/rag';

export const GET: RequestHandler = async () => {
	try {
		const documents = await getAllKnowledgeDocuments();
		return json({ documents });
	} catch (error) {
		console.error('Error fetching knowledge base:', error);
		return json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { title, content, category, metadata } = await request.json();

		if (!title || !content) {
			return json({ error: 'Title and content are required' }, { status: 400 });
		}

		const document = await storeKnowledgeDocument(title, content, category, metadata);
		return json({ success: true, document });
	} catch (error) {
		console.error('Error storing knowledge document:', error);
		return json(
			{ error: 'Failed to store document', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const { id, title, content, category } = await request.json();

		if (!id) {
			return json({ error: 'ID is required' }, { status: 400 });
		}

		const document = await updateKnowledgeDocument(id, title, content, category);
		return json({ success: true, document });
	} catch (error) {
		console.error('Error updating knowledge document:', error);
		return json(
			{ error: 'Failed to update document', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'ID is required' }, { status: 400 });
		}

		await deleteKnowledgeDocument(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting knowledge document:', error);
		return json(
			{ error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
