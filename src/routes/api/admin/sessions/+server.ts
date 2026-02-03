import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const intent = url.searchParams.get('intent') || undefined;

		const skip = (page - 1) * limit;

		const [conversations, total] = await Promise.all([
			prisma.conversation.findMany({
				where: intent ? { intent } : undefined,
				include: {
					messages: {
						orderBy: { createdAt: 'asc' }
					},
					profile: {
						select: {
							name: true,
							email: true
						}
					}
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit
			}),
			prisma.conversation.count({
				where: intent ? { intent } : undefined
			})
		]);

		const sessions = conversations.map((conv) => {
			const messages = conv.messages;
			const firstMessage = messages[0];
			const lastMessage = messages[messages.length - 1];
			const duration = lastMessage && firstMessage
				? Math.floor((lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) / 1000)
				: 0;

			const jobMatch = messages.find((m) => m.metadata && (m.metadata as any).matchingRate !== undefined);
			const jobMatchRate = jobMatch ? (jobMatch.metadata as any).matchingRate : null;

			return {
				id: conv.id,
				sessionId: conv.sessionId,
				intent: conv.intent,
				messageCount: messages.length,
				duration,
				jobMatchRate,
				createdAt: conv.createdAt,
				updatedAt: conv.updatedAt,
				messages: messages.map((m) => ({
					role: m.role,
					content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
					createdAt: m.createdAt
				}))
			};
		});

		return json({
			sessions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching sessions:', error);
		return json({ error: 'Failed to fetch sessions' }, { status: 500 });
	}
};
