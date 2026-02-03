import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { retrieveRelevantKnowledge } from './rag';

let openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
	if (!env.OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY is not set');
	}
	if (!openai) {
		openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY
		});
	}
	return openai;
}

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

	const openaiClient = getOpenAIClient();
	const completion = await openaiClient.chat.completions.create({
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

export interface ConversationResponse {
	response: string;
	segues?: string[]; // Suggested next prompts
}

export async function generateConversationResponse(
	messages: Array<{ role: 'user' | 'assistant'; content: string }>,
	intent: string,
	context?: ConversationContext
): Promise<ConversationResponse> {
	// Retrieve relevant knowledge base documents using RAG
	const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
	const relevantKnowledge = await retrieveRelevantKnowledge(lastUserMessage, 3);

	// Build knowledge context
	const knowledgeContext = relevantKnowledge.length > 0
		? `\n\nRELEVANT KNOWLEDGE BASE:\n${relevantKnowledge.map((kb) => `- ${kb.title}: ${kb.content.substring(0, 500)}`).join('\n\n')}`
		: '';

	// Customizable personality and behavior prompts
	const personalityPrompts: Record<string, string> = {
		hire: `You're Flo's friendly and professional AI assistant helping potential employers understand Flo's value. 
Be warm, enthusiastic, and authentic. Show genuine excitement about matching Flo with great opportunities.
Keep responses conversational and natural - like you're chatting with a colleague, not writing a formal cover letter.
Use the knowledge base to speak authentically about Flo's background, personality, and work style.`,
		
		partner: `You're Flo's collaborative AI assistant exploring partnership opportunities.
Be open, creative, and solution-oriented. Show curiosity about potential projects.
Keep it friendly and professional - like brainstorming with a potential collaborator.
Use the knowledge base to understand Flo's interests, expertise, and collaboration style.`,
		
		fun: `You're Flo's fun and engaging AI assistant for casual conversations.
Be witty, personable, and authentic. Match the user's energy and tone.
Feel free to be playful, use humor, and show personality.
Use the knowledge base to share interesting facts about Flo or have engaging discussions.`,
		
		newsletter: `You're Flo's helpful AI assistant for newsletter subscriptions.
Be friendly and informative. Help users understand what they'll get from subscribing.
Keep it casual and welcoming - like inviting someone to join a community.
Use the knowledge base to explain Flo's projects, updates, and what subscribers can expect.`
	};

	// Retrieve segue guidelines from knowledge base
	const segueGuidelines = await retrieveRelevantKnowledge('segue guidelines prompt suggestions', 1);
	const segueGuidelineText = segueGuidelines.length > 0
		? `\n\nSEGUE GUIDELINES:\n${segueGuidelines.map((kb) => kb.content).join('\n\n')}`
		: '';

	const basePersonality = `You are Flo's AI assistant. Your personality should be:
- Conversational and natural (not robotic or overly formal)
- Authentic and genuine (show real personality, not corporate speak)
- Adaptable (match the user's tone and energy)
- Helpful but not pushy
- Use contractions and natural language (it's fine to say "I'm" instead of "I am")
- Keep responses concise but warm
- Show enthusiasm when appropriate

${personalityPrompts[intent] || personalityPrompts.fun}

Use the knowledge base information provided to guide your responses authentically. Be conversational, natural, and helpful. If job matching context is provided, reference it naturally.${knowledgeContext}${segueGuidelineText}`;

	const systemPrompt = basePersonality;

	const contextMessages = context && context.matchingRate !== undefined
		? [
				{
					role: 'system' as const,
					content: `Context: Job match analysis shows ${context.matchingRate}% match. ${context.analysis || ''}`
				}
			]
		: [];

	const openaiClient = getOpenAIClient();
	const completion = await openaiClient.chat.completions.create({
		model: 'gpt-4-turbo-preview',
		messages: [
			{ role: 'system', content: systemPrompt },
			...contextMessages,
			...messages,
			{
				role: 'system',
				content: `After your response, generate 2-4 short, engaging segue prompts (questions or statements) that would naturally continue the conversation. These should be:
- Contextually relevant to what was just discussed
- Natural conversation continuations
- Short (5-10 words max)
- Engaging and specific
- Aligned with the current intent (${intent})

Format your response as JSON:
{
  "response": "your main response text here",
  "segues": ["suggested prompt 1", "suggested prompt 2", "suggested prompt 3"]
}`
			}
		],
		temperature: 0.9, // Increased for more natural, varied responses
		presence_penalty: 0.3, // Encourage more diverse responses
		frequency_penalty: 0.3, // Reduce repetition
		response_format: { type: 'json_object' }
	});

	const content = completion.choices[0].message.content || '{}';
	
	try {
		const parsed = JSON.parse(content);
		return {
			response: parsed.response || content,
			segues: parsed.segues || []
		};
	} catch {
		// Fallback if JSON parsing fails
		return {
			response: content,
			segues: []
		};
	}
}
