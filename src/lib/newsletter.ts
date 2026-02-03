import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { prisma } from './db';

let resend: Resend | null = null;

if (env.RESEND_API_KEY) {
	resend = new Resend(env.RESEND_API_KEY);
}

export interface NewsletterSubscriber {
	email: string;
	name?: string;
	source?: string;
	conversationId?: string;
	metadata?: Record<string, any>;
}

/**
 * Subscribe user to newsletter
 */
export async function subscribeToNewsletter(
	subscriber: NewsletterSubscriber
): Promise<{ success: boolean; message: string }> {
	try {
		// Check if already subscribed
		const existing = await prisma.newsletterSubscriber.findUnique({
			where: { email: subscriber.email }
		});

		if (existing && !existing.unsubscribedAt) {
			return { success: false, message: 'Already subscribed' };
		}

		if (existing && existing.unsubscribedAt) {
			// Re-subscribe
			await prisma.newsletterSubscriber.update({
				where: { email: subscriber.email },
				data: {
					name: subscriber.name,
					source: subscriber.source,
					conversationId: subscriber.conversationId,
					metadata: subscriber.metadata as any,
					unsubscribedAt: null
				}
			});
		} else {
			// New subscription
			await prisma.newsletterSubscriber.create({
				data: {
					email: subscriber.email,
					name: subscriber.name,
					source: subscriber.source || 'conversation',
					conversationId: subscriber.conversationId,
					metadata: subscriber.metadata as any
				}
			});
		}

		// Send welcome email if Resend is configured
		if (resend && env.RESEND_FROM_EMAIL) {
			try {
				await resend.emails.send({
					from: env.RESEND_FROM_EMAIL,
					to: subscriber.email,
					subject: 'Welcome to Flo\'s Newsletter!',
					html: `
						<h1>Welcome!</h1>
						<p>Thanks for subscribing to Flo's newsletter. You'll receive updates about projects, insights, and more.</p>
						<p>If you didn't subscribe, you can <a href="${env.PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}">unsubscribe here</a>.</p>
					`
				});
			} catch (emailError) {
				console.error('Failed to send welcome email:', emailError);
				// Don't fail the subscription if email fails
			}
		}

		return { success: true, message: 'Successfully subscribed!' };
	} catch (error) {
		console.error('Newsletter subscription error:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Failed to subscribe'
		};
	}
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<void> {
	await prisma.newsletterSubscriber.updateMany({
		where: { email },
		data: {
			unsubscribedAt: new Date()
		}
	});
}

/**
 * Get all active subscribers
 */
export async function getActiveSubscribers() {
	return await prisma.newsletterSubscriber.findMany({
		where: {
			unsubscribedAt: null
		},
		orderBy: {
			subscribedAt: 'desc'
		}
	});
}

/**
 * Export subscribers to CSV format
 */
export async function exportSubscribersCSV(): Promise<string> {
	const subscribers = await getActiveSubscribers();

	const headers = ['Email', 'Name', 'Source', 'Subscribed At', 'Metadata'];
	const rows = subscribers.map((sub) => [
		sub.email,
		sub.name || '',
		sub.source || '',
		sub.subscribedAt.toISOString(),
		JSON.stringify(sub.metadata || {})
	]);

	return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
}
