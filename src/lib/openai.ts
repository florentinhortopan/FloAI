import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { retrieveRelevantKnowledge } from './rag';

if (!env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY
});

export interface JobMatchingContext {
	profile: {
		skills: string[];
		experience: any;
		resumeText?: string;
	};
	jobDescription: string;
	intent: 'hire' | 'partner' | 'fun' | 'newsletter';
}

export async function analyzeJobMatch(context: JobMatchingContext): Promise<{
	matchingRate: number;
	analysis: string;
	strengths: string[];
	gaps: string[];
	recommendations: string[];
}> {
	const systemPrompt = `You are Flo's AI assistant, helping analyze job matches. You're professional, insightful, and personable.
	
Your task is to analyze how well Flo's profile matches a given job description and provide:
1. A matching rate (0-100%)
2. Detailed analysis
3. Key strengths
4. Potential gaps
5. Actionable recommendations

Be specific and reference actual skills and experiences from the profile.`;

	const userPrompt = `Analyze this job match:

PROFILE:
Skills: ${context.profile.skills.join(', ')}
Experience: ${JSON.stringify(context.profile.experience, null, 2)}
${context.profile.resumeText ? `Resume: ${context.profile.resumeText.substring(0, 2000)}` : ''}

JOB DESCRIPTION:
${context.jobDescription.substring(0, 4000)}

INTENT: ${context.intent}

Provide a JSON response with:
{
  "matchingRate": number (0-100),
  "analysis": "detailed text analysis",
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;

	const completion = await openai.chat.completions.create({
		model: 'gpt-4-turbo-preview',
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt }
		],
		temperature: 0.7,
		response_format: { type: 'json_object' }
	});

	const response = JSON.parse(completion.choices[0].message.content || '{}');
	return {
		matchingRate: response.matchingRate || 0,
		analysis: response.analysis || '',
		strengths: response.strengths || [],
		gaps: response.gaps || [],
		recommendations: response.recommendations || []
	};
}

export interface ConversationContext {
	matchingRate?: number;
	analysis?: string;
	strengths?: string[];
	gaps?: string[];
	recommendations?: string[];
}

export async function generateConversationResponse(
	messages: Array<{ role: 'user' | 'assistant'; content: string }>,
	intent: string,
	context?: ConversationContext
): Promise<string> {
	// Retrieve relevant knowledge base documents using RAG
	const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
	const relevantKnowledge = await retrieveRelevantKnowledge(lastUserMessage, 3);

	// Build knowledge context
	const knowledgeContext = relevantKnowledge.length > 0
		? `\n\nRELEVANT KNOWLEDGE BASE:\n${relevantKnowledge.map((kb) => `- ${kb.title}: ${kb.content.substring(0, 500)}`).join('\n\n')}`
		: '';

	const systemPrompt = `You are Flo's AI assistant. You're helping with: ${intent}.

${intent === 'hire' ? 'Help potential employers understand Flo\'s value and match with job opportunities.' : ''}
${intent === 'partner' ? 'Help potential partners explore collaboration opportunities.' : ''}
${intent === 'fun' ? 'Be engaging, witty, and have fun conversations.' : ''}
${intent === 'newsletter' ? 'Help users subscribe and learn about Flo\'s updates.' : ''}

Use the knowledge base information provided to guide your responses. Be conversational, natural, and helpful. If job matching context is provided, reference it naturally.${knowledgeContext}`;

	const contextMessages = context && context.matchingRate !== undefined
		? [
				{
					role: 'system' as const,
					content: `Context: Job match analysis shows ${context.matchingRate}% match. ${context.analysis || ''}`
				}
			]
		: [];

	const completion = await openai.chat.completions.create({
		model: 'gpt-4-turbo-preview',
		messages: [
			{ role: 'system', content: systemPrompt },
			...contextMessages,
			...messages
		],
		temperature: 0.8
	});

	return completion.choices[0].message.content || '';
}
