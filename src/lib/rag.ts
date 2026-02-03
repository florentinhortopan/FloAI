import { getOpenAIClient } from './openai';
import { prisma } from './db';

export interface KnowledgeDocument {
	id: string;
	title: string;
	content: string;
	category?: string;
}

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
	const openaiClient = getOpenAIClient();
	const response = await openaiClient.embeddings.create({
		model: 'text-embedding-3-small',
		input: text.substring(0, 8000) // Limit to avoid token limits
	});

	return response.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) return 0;

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Store a knowledge base document with embeddings
 */
export async function storeKnowledgeDocument(
	title: string,
	content: string,
	category?: string,
	metadata?: Record<string, any>
): Promise<KnowledgeDocument> {
	const embedding = await generateEmbedding(content);

	const doc = await prisma.knowledgeBase.create({
		data: {
			title,
			content,
			category,
			embedding: embedding as any,
			metadata: metadata as any
		}
	});

	return {
		id: doc.id,
		title: doc.title,
		content: doc.content,
		category: doc.category || undefined
	};
}

/**
 * Retrieve relevant knowledge base documents using semantic search
 */
export async function retrieveRelevantKnowledge(
	query: string,
	limit: number = 5,
	category?: string
): Promise<KnowledgeDocument[]> {
	// Generate embedding for query
	const queryEmbedding = await generateEmbedding(query);

	// Get all knowledge base documents
	const allDocs = await prisma.knowledgeBase.findMany({
		where: category ? { category } : undefined
	});

	// Calculate similarity scores
	const scoredDocs = allDocs
		.map((doc) => {
			if (!doc.embedding) return null;
			const similarity = cosineSimilarity(
				queryEmbedding,
				doc.embedding as number[]
			);
			return {
				doc,
				similarity
			};
		})
		.filter((item): item is { doc: typeof allDocs[0]; similarity: number } => item !== null)
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, limit);

	return scoredDocs.map(({ doc }) => ({
		id: doc.id,
		title: doc.title,
		content: doc.content,
		category: doc.category || undefined
	}));
}

/**
 * Get all knowledge base documents
 */
export async function getAllKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
	const docs = await prisma.knowledgeBase.findMany({
		orderBy: { createdAt: 'desc' }
	});

	return docs.map((doc) => ({
		id: doc.id,
		title: doc.title,
		content: doc.content,
		category: doc.category || undefined
	}));
}

/**
 * Delete a knowledge base document
 */
export async function deleteKnowledgeDocument(id: string): Promise<void> {
	await prisma.knowledgeBase.delete({
		where: { id }
	});
}

/**
 * Update a knowledge base document
 */
export async function updateKnowledgeDocument(
	id: string,
	title?: string,
	content?: string,
	category?: string
): Promise<KnowledgeDocument> {
	const existing = await prisma.knowledgeBase.findUnique({
		where: { id }
	});

	if (!existing) {
		throw new Error('Document not found');
	}

	const finalContent = content || existing.content;
	const embedding = await generateEmbedding(finalContent);

	const updated = await prisma.knowledgeBase.update({
		where: { id },
		data: {
			title: title || existing.title,
			content: finalContent,
			category: category !== undefined ? category : existing.category,
			embedding: embedding as any
		}
	});

	return {
		id: updated.id,
		title: updated.title,
		content: updated.content,
		category: updated.category || undefined
	};
}
