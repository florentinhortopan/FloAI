/**
 * Customizable configuration for FloAI
 * Update these values to customize the bot's behavior
 */

export const config = {
	// Welcome message shown when user first arrives
	welcomeMessage: "Hey! I'm Flo's AI assistant. What would you like to explore today?",
	
	// Intent-specific messages shown when user selects an intent
	intentMessages: {
		hire: "Great! I'm here to help you see how Flo matches job opportunities. You can paste a job description, share a job link, or upload a document.",
		partner: "Awesome! Let's explore collaboration opportunities. Tell me about your project and we'll see how we can work together!",
		fun: "Perfect! Let's have some fun! What's on your mind?",
		newsletter: "Thanks for your interest! I'd love to help you subscribe to Flo's newsletter. What would you like to know?"
	}
};
