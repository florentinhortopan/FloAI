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
