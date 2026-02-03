<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import type { Intent, Message } from '$lib/types';
	import { createSpeechRecognition } from '$lib/voice';
	import MessageBubble from './MessageBubble.svelte';
	import AudioControls from './AudioControls.svelte';

	export let selectedIntent: Intent;
	export let sessionId: string | null = null;

	const dispatch = createEventDispatcher();

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
		const welcomeMessages: Record<Intent, string> = {
			hire: "Hi! I'm here to help you see how Flo matches your job requirements. You can paste a job description, share a job link, or upload a document. Let's get started!",
			partner: "Hello! Excited to explore collaboration opportunities. Tell me about your project and let's see how we can work together!",
			fun: "Hey there! 👋 Let's have some fun! What's on your mind?",
			newsletter: "Thanks for your interest! I'd love to help you subscribe to Flo's newsletter. What would you like to know?"
		};

		messages = [
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content: welcomeMessages[selectedIntent],
				createdAt: new Date()
			}
		];
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
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId,
					intent: selectedIntent,
					message: messageText,
					conversationHistory: messages.slice(0, -1).map((m) => ({
						role: m.role,
						content: m.content
					}))
				})
			});

			if (!response.ok) throw new Error('Failed to get response');

			const data = await response.json();
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
			messages = [
				...messages,
				{
					id: crypto.randomUUID(),
					role: 'assistant',
					content: 'Sorry, I encountered an error. Please try again.',
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

	function handleBack() {
		dispatch('back');
	}
</script>

<div class="max-w-4xl mx-auto">
	<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
		<!-- Header -->
		<div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<button
					on:click={handleBack}
					class="p-2 rounded-lg hover:bg-white/20 transition-colors"
					aria-label="Back"
				>
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div>
					<h2 class="text-xl font-bold text-white">
						{selectedIntent === 'hire' ? '💼 Hire Flo' : ''}
						{selectedIntent === 'partner' ? '🤝 Partner' : ''}
						{selectedIntent === 'fun' ? '🎉 Let\'s Chat' : ''}
						{selectedIntent === 'newsletter' ? '📧 Newsletter' : ''}
					</h2>
					<p class="text-blue-100 text-sm">Session: {sessionId?.substring(0, 8)}</p>
				</div>
			</div>
		</div>

		<!-- Messages -->
		<div class="h-[600px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900">
			{#each messages as message (message.id)}
				<MessageBubble {message} />
			{/each}
			{#if isLoading}
				<div class="flex items-center space-x-2 text-muted-foreground">
					<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
					<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
					<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
				</div>
			{/if}
		</div>

		<!-- Input Area -->
		<div class="p-6 border-t border-border bg-white dark:bg-slate-800">
			{#if selectedIntent === 'hire'}
				<div class="mb-2 flex items-center gap-2">
					<label
						for="file-upload"
						class="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
					>
						{uploadingFile ? 'Uploading...' : '📎 Upload PDF/DOCX'}
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
					<span class="text-xs text-muted-foreground">or paste a job URL or description</span>
				</div>
			{/if}
			<div class="flex items-end space-x-4">
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
						class="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
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
