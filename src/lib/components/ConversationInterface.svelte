<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import type { Intent, Message } from '$lib/types';
	import { createSpeechRecognition } from '$lib/voice';
	import MessageBubble from './MessageBubble.svelte';
	import AudioControls from './AudioControls.svelte';
	import IntentCTAs from './IntentCTAs.svelte';
	import { config } from '$lib/config';

	export let sessionId: string | null = null;

	const dispatch = createEventDispatcher();

	let selectedIntent: Intent | null = null;
	
	// Computed property for IntentCTAs component
	$: currentIntent = selectedIntent;

	let messages: Message[] = [];
	let inputText = '';
	let isLoading = false;
	let isListening = false;
	let recognition: SpeechRecognition | null = null;
	let audioContext: AudioContext | null = null;
	let currentAudio: HTMLAudioElement | null = null;
	let fileInput: HTMLInputElement | null = null;
	let uploadingFile = false;

	onMount(() => {
		recognition = createSpeechRecognition();
		if (recognition) {
			recognition.onresult = (event) => {
				const transcript = Array.from(event.results)
					.map((result) => result[0].transcript)
					.join('');
				inputText = transcript;
			};
			recognition.onend = () => {
				isListening = false;
			};
		}

		// Initialize audio context for playback
		audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

		// Send welcome message
		sendWelcomeMessage();
	});

	async function sendWelcomeMessage() {
		messages = [
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content: config.welcomeMessage,
				createdAt: new Date()
			}
		];
	}

	function handleIntentSelect(event: CustomEvent<Intent> | Intent) {
		const intent = event instanceof CustomEvent ? event.detail : event;
		selectedIntent = intent;
		
		// Add a message indicating intent change
		messages = [
			...messages,
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content: config.intentMessages[intent],
				createdAt: new Date()
			}
		];
	}

	function handleSegueSelect(event: CustomEvent<string>) {
		const segueText = event.detail;
		// Set the segue text as input and send it
		inputText = segueText;
		sendMessage();
	}

	async function sendMessage() {
		if (!inputText.trim() || isLoading) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			content: inputText.trim(),
			createdAt: new Date()
		};

		messages = [...messages, userMessage];
		const messageText = inputText.trim();
		inputText = '';
		isLoading = true;

		try {
			// Use selected intent or default to 'fun' if none selected
			const intentValue = selectedIntent || 'fun';
			
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId,
					intent: intentValue,
					message: messageText,
					conversationHistory: messages.slice(0, -1).map((m) => ({
						role: m.role,
						content: m.content
					}))
				})
			});

			const data = await response.json();

			// Check if API returned an error
			if (!response.ok || data.error) {
				const errorMessage = data.details || data.error || `HTTP ${response.status}: ${response.statusText}`;
				console.error('API Error:', {
					status: response.status,
					statusText: response.statusText,
					error: data.error,
					details: data.details,
					fullResponse: data
				});
				throw new Error(errorMessage);
			}

			// Check if response field exists
			if (!data.response) {
				console.error('Invalid API response:', data);
				throw new Error('Invalid response from server');
			}

			const assistantMessage: Message = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: data.response,
				createdAt: new Date(),
				metadata: data.metadata
			};

			messages = [...messages, assistantMessage];

			// Auto-play audio response if available
			if (data.audioUrl) {
				playAudio(data.audioUrl);
			}
		} catch (error) {
			console.error('Error sending message:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			messages = [
				...messages,
				{
					id: crypto.randomUUID(),
					role: 'assistant',
					content: `Sorry, I encountered an error: ${errorMessage}. Please check the browser console for details or try again.`,
					createdAt: new Date()
				}
			];
		} finally {
			isLoading = false;
		}
	}

	function toggleListening() {
		if (!recognition) {
			alert('Speech recognition is not supported in your browser.');
			return;
		}

		if (isListening) {
			recognition.stop();
			isListening = false;
		} else {
			recognition.start();
			isListening = true;
		}
	}

	async function playAudio(audioUrl: string) {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio = null;
		}

		const audio = new Audio(audioUrl);
		currentAudio = audio;
		await audio.play();
		audio.onended = () => {
			currentAudio = null;
		};
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploadingFile = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/parse-job', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) throw new Error('Failed to parse file');

			const data = await response.json();
			inputText = `Job Title: ${data.jobDescription.title}\n${data.jobDescription.company ? `Company: ${data.jobDescription.company}\n` : ''}Description: ${data.jobDescription.description}`;
		} catch (error) {
			console.error('File upload error:', error);
			alert('Failed to parse file. Please try pasting the content instead.');
		} finally {
			uploadingFile = false;
			if (fileInput) fileInput.value = '';
		}
	}

</script>

<!-- High contrast WordPress.com-inspired chat interface -->
<div class="max-w-4xl mx-auto">
	<div class="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
		<!-- Header - High contrast, bold -->
		<div class="bg-primary text-primary-foreground px-6 py-4 border-b border-primary/20">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-xl font-bold">FloAI Assistant</h2>
					<p class="text-sm opacity-90">Session: {sessionId?.substring(0, 8)}</p>
				</div>
			</div>
			<!-- Intent Selection CTAs -->
			<IntentCTAs {currentIntent} variant="header" on:select={handleIntentSelect} />
		</div>

		<!-- Messages - High contrast background -->
		<div class="h-[600px] overflow-y-auto p-6 space-y-4 bg-background">
			{#each messages as message (message.id)}
				<MessageBubble {message} on:segueSelect={handleSegueSelect} />
				{#if message.role === 'assistant' && message.id === messages[0]?.id}
					<!-- Show intent CTAs after welcome message -->
					<div class="flex justify-center my-4">
						<IntentCTAs {currentIntent} on:select={handleIntentSelect} />
					</div>
				{/if}
			{/each}
			{#if isLoading}
				<div class="flex items-center space-x-2 text-muted-foreground">
					<div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
					<div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
					<div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
				</div>
			{/if}
		</div>

		<!-- Input Area - High contrast border -->
		<div class="p-6 border-t-2 border-border bg-card">
			{#if selectedIntent === 'hire'}
				<div class="mb-3 flex items-center gap-3">
					<label
						for="file-upload"
						class="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer transition-colors border border-border"
					>
						{uploadingFile ? 'Uploading...' : 'Upload PDF/DOCX'}
					</label>
					<input
						id="file-upload"
						bind:this={fileInput}
						type="file"
						accept=".pdf,.docx,.doc"
						on:change={handleFileUpload}
						class="hidden"
						disabled={uploadingFile || isLoading}
					/>
					<span class="text-xs text-muted-foreground font-medium">or paste a job URL or description</span>
				</div>
			{/if}
			<div class="flex items-end gap-3">
				<div class="flex-1 relative">
					<textarea
						bind:value={inputText}
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						placeholder={
							selectedIntent === 'hire'
								? 'Paste job description, URL, or upload a file...'
								: 'Type your message or use voice input...'
						}
						class="w-full px-4 py-3 rounded-md border-2 border-input bg-background text-foreground resize-none focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
						rows="2"
						disabled={isLoading || uploadingFile}
					></textarea>
				</div>
				<AudioControls
					isListening={isListening}
					on:toggle={toggleListening}
					on:send={sendMessage}
					disabled={isLoading || uploadingFile || !inputText.trim()}
				/>
			</div>
		</div>
	</div>
</div>
