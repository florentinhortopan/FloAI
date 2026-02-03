import { env } from '$env/dynamic/private';

export interface VoiceConfig {
	apiKey: string;
	voiceId: string;
}

export function getVoiceConfig(): VoiceConfig | null {
	if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) {
		return null;
	}
	return {
		apiKey: env.ELEVENLABS_API_KEY,
		voiceId: env.ELEVENLABS_VOICE_ID
	};
}

export async function synthesizeSpeech(text: string, config: VoiceConfig): Promise<ArrayBuffer> {
	const response = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
		{
			method: 'POST',
			headers: {
				'Accept': 'audio/mpeg',
				'Content-Type': 'application/json',
				'xi-api-key': config.apiKey
			},
			body: JSON.stringify({
				text,
				model_id: 'eleven_multilingual_v2',
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.75
				}
			})
		}
	);

	if (!response.ok) {
		throw new Error(`ElevenLabs API error: ${response.statusText}`);
	}

	return await response.arrayBuffer();
}

// Browser-based speech recognition (fallback)
export function createSpeechRecognition(): SpeechRecognition | null {
	if (typeof window === 'undefined') return null;

	const SpeechRecognition =
		(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

	if (!SpeechRecognition) return null;

	const recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.lang = 'en-US';

	return recognition;
}
