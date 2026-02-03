import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateConversationResponse, analyzeJobMatch, type ConversationContext } from '$lib/openai';
import { prisma } from '$lib/db';
import { getVoiceConfig } from '$lib/voice.server';
import { synthesizeSpeech } from '$lib/voice';
import { parseJobDescription } from '$lib/jobParser';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { sessionId, intent, message, conversationHistory } = await request.json();

		// Get or create profile (for now, using a default profile)
		// TODO: Replace with actual user profile management
		let profile = await prisma.profile.findFirst();
		if (!profile) {
			profile = await prisma.profile.create({
				data: {
					name: 'Flo',
					email: 'flo@example.com',
					skills: ['AI/ML', 'Full Stack Development', 'Product Management'],
					resumeText: 'Experienced developer and AI enthusiast...',
					experience: {
						years: 5,
						roles: ['Senior Developer', 'AI Engineer']
					}
				}
			});
		}

		// Get or create conversation
		let conversation = await prisma.conversation.findUnique({
			where: { sessionId }
		});

		if (!conversation) {
			conversation = await prisma.conversation.create({
				data: {
					sessionId,
					profileId: profile.id,
					intent
				}
			});
		}

		// Save user message
		await prisma.message.create({
			data: {
				conversationId: conversation.id,
				role: 'user',
				content: message
			}
		});

		// Check if message contains job description (URL, keywords, or long text)
		const isURL = message.startsWith('http://') || message.startsWith('https://');
		const isJobDescription = isURL ||
			message.toLowerCase().includes('job') ||
			message.toLowerCase().includes('position') ||
			message.toLowerCase().includes('role') ||
			message.toLowerCase().includes('requirements') ||
			message.length > 500; // Long text might be a job description

		let jobDescriptionText = message;
		let jobMatchContext = null;
		let response = '';

		// Parse job description if it's a URL or seems like a job description
		if (intent === 'hire' && isJobDescription) {
			try {
				if (isURL) {
					// Parse URL
					const parsed = await parseJobDescription(message, 'url');
					jobDescriptionText = parsed.description;
					
					// Store parsed job description
					await prisma.jobDescription.create({
						data: {
							url: message,
							title: parsed.title,
							company: parsed.company,
							description: parsed.description,
							rawContent: parsed.rawContent,
							format: 'url'
						}
					});
				}
			} catch (error) {
				console.error('Error parsing job description:', error);
				// Continue with original message if parsing fails
			}

			// Analyze job match
			const matchResult = await analyzeJobMatch({
				profile: {
					skills: profile.skills,
					experience: profile.experience,
					resumeText: profile.resumeText || undefined
				},
				jobDescription: jobDescriptionText,
				intent
			});

			jobMatchContext = matchResult;

			// Generate response with context
			const conversationContext: ConversationContext = {
				matchingRate: matchResult.matchingRate,
				analysis: matchResult.analysis,
				strengths: matchResult.strengths,
				gaps: matchResult.gaps,
				recommendations: matchResult.recommendations
			};

			response = await generateConversationResponse(
				conversationHistory.map((m: any) => ({
					role: m.role,
					content: m.content
				})),
				intent,
				conversationContext
			);
		} else {
			// Regular conversation
			response = await generateConversationResponse(
				conversationHistory.map((m: any) => ({
					role: m.role,
					content: m.content
				})),
				intent
			);
		}

		// Save assistant message
		await prisma.message.create({
			data: {
				conversationId: conversation.id,
				role: 'assistant',
				content: response,
				metadata: jobMatchContext
			}
		});

		// Generate audio if voice config is available
		let audioUrl = null;
		const voiceConfig = getVoiceConfig();
		if (voiceConfig) {
			try {
				const audioBuffer = await synthesizeSpeech(response, voiceConfig);
				// In production, you'd upload this to a storage service (S3, Cloudflare R2, etc.)
				// For now, we'll return a data URL (not ideal for production)
				const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
				audioUrl = URL.createObjectURL(blob);
			} catch (error) {
				console.error('Error synthesizing speech:', error);
			}
		}

		return json({
			response,
			metadata: jobMatchContext,
			audioUrl
		});
	} catch (error) {
		console.error('Chat API error:', error);
		
		// Log full error details for debugging
		if (error instanceof Error) {
			console.error('Error name:', error.name);
			console.error('Error message:', error.message);
			console.error('Error stack:', error.stack);
		}
		
		// Check for specific error types
		let errorMessage = 'Failed to process message';
		let errorDetails = error instanceof Error ? error.message : 'Unknown error';
		
		if (error instanceof Error) {
			// Database connection errors
			if (error.message.includes('DATABASE_URL') || error.message.includes('Prisma')) {
				errorMessage = 'Database connection error';
				errorDetails = 'Please check your database configuration';
			}
			// OpenAI API errors
			else if (error.message.includes('OPENAI_API_KEY') || error.message.includes('OpenAI')) {
				errorMessage = 'OpenAI API error';
				errorDetails = 'Please check your OpenAI API key configuration';
			}
			// Network errors
			else if (error.message.includes('fetch') || error.message.includes('network')) {
				errorMessage = 'Network error';
				errorDetails = 'Please check your internet connection';
			}
		}
		
		return json(
			{ 
				error: errorMessage, 
				details: errorDetails,
				...(process.env.NODE_ENV === 'development' && {
					stack: error instanceof Error ? error.stack : undefined
				})
			},
			{ status: 500 }
		);
	}
};
