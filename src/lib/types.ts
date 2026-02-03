export type Intent = 'hire' | 'partner' | 'fun' | 'newsletter';

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	audioUrl?: string;
	createdAt: Date;
	metadata?: {
		matchingRate?: number;
		analysis?: string;
		strengths?: string[];
		gaps?: string[];
		recommendations?: string[];
	};
}

export interface JobMatchResult {
	matchingRate: number;
	analysis: string;
	strengths: string[];
	gaps: string[];
	recommendations: string[];
}
