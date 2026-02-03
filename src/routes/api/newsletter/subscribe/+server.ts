import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { subscribeToNewsletter } from '$lib/newsletter';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, name, conversationId, metadata } = await request.json();

		if (!email || !email.includes('@')) {
			return json({ error: 'Valid email is required' }, { status: 400 });
		}

		const result = await subscribeToNewsletter({
			email,
			name,
			source: 'conversation',
			conversationId,
			metadata
		});

		if (!result.success) {
			return json({ error: result.message }, { status: 400 });
		}

		return json({ success: true, message: result.message });
	} catch (error) {
		console.error('Newsletter subscription error:', error);
		return json(
			{ error: 'Failed to subscribe', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
