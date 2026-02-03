import { c as create_ssr_component, d as createEventDispatcher, e as each, v as validate_component } from "../../chunks/ssr.js";
import { e as escape } from "../../chunks/escape.js";
const IntentSelector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  const intents = [
    {
      id: "hire",
      title: "Hire Flo",
      description: "Looking for talent? Let me analyze how Flo matches your job requirements.",
      icon: "💼",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "partner",
      title: "Partner for a Project",
      description: "Explore collaboration opportunities and see how we can work together.",
      icon: "🤝",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "fun",
      title: "Just Having Fun",
      description: "Let's chat! Ask me anything or just have a casual conversation.",
      icon: "🎉",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "newsletter",
      title: "Subscribe to Newsletter",
      description: "Stay updated with Flo's latest projects, insights, and updates.",
      icon: "📧",
      color: "from-green-500 to-emerald-500"
    }
  ];
  return `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">${each(intents, (intent) => {
    return `<button class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"><div class="${"absolute inset-0 bg-gradient-to-br " + escape(intent.color, true) + " opacity-0 group-hover:opacity-10 transition-opacity duration-300"}"></div> <div class="relative z-10 space-y-4"><div class="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">${escape(intent.icon)}</div> <h3 class="text-2xl font-bold text-foreground">${escape(intent.title)}</h3> <p class="text-muted-foreground">${escape(intent.description)}</p> <div class="flex items-center text-sm font-semibold text-primary mt-4 group-hover:translate-x-2 transition-transform duration-300" data-svelte-h="svelte-1mzrhmt">Get Started
					<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> </div></div> </button>`;
  })}</div>`;
});
const css = {
  code: "@keyframes svelte-1xx6whh-fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in.svelte-1xx6whh{animation:svelte-1xx6whh-fade-in 0.6s ease-out}",
  map: '{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport IntentSelector from \\"$lib/components/IntentSelector.svelte\\";\\nimport ConversationInterface from \\"$lib/components/ConversationInterface.svelte\\";\\nlet selectedIntent = null;\\nlet sessionId = null;\\nonMount(() => {\\n  sessionId = crypto.randomUUID();\\n});\\nfunction handleIntentSelect(intent) {\\n  selectedIntent = intent;\\n}\\nfunction handleBack() {\\n  selectedIntent = null;\\n}\\n<\/script>\\n\\n<div class=\\"min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900\\">\\n\\t<div class=\\"container mx-auto px-4 py-8\\">\\n\\t\\t{#if !selectedIntent}\\n\\t\\t\\t<div class=\\"max-w-4xl mx-auto text-center space-y-8\\">\\n\\t\\t\\t\\t<div class=\\"space-y-4 animate-fade-in\\">\\n\\t\\t\\t\\t\\t<h1 class=\\"text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent\\">\\n\\t\\t\\t\\t\\t\\tFloAI\\n\\t\\t\\t\\t\\t</h1>\\n\\t\\t\\t\\t\\t<p class=\\"text-xl text-muted-foreground\\">\\n\\t\\t\\t\\t\\t\\tYour intelligent virtual assistant for job matching and collaboration\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t\\t<IntentSelector on:select={handleIntentSelect} />\\n\\t\\t\\t</div>\\n\\t\\t{:else}\\n\\t\\t\\t<ConversationInterface {selectedIntent} {sessionId} on:back={handleBack} />\\n\\t\\t{/if}\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t@keyframes fade-in {\\n\\t\\tfrom {\\n\\t\\t\\topacity: 0;\\n\\t\\t\\ttransform: translateY(20px);\\n\\t\\t}\\n\\t\\tto {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\ttransform: translateY(0);\\n\\t\\t}\\n\\t}\\n\\n\\t.animate-fade-in {\\n\\t\\tanimation: fade-in 0.6s ease-out;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAsCC,WAAW,sBAAQ,CAClB,IAAK,CACJ,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,IAAI,CAC3B,CACA,EAAG,CACF,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,CAAC,CACxB,CACD,CAEA,+BAAiB,CAChB,SAAS,CAAE,sBAAO,CAAC,IAAI,CAAC,QACzB"}'
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"><div class="container mx-auto px-4 py-8">${`<div class="max-w-4xl mx-auto text-center space-y-8"><div class="space-y-4 animate-fade-in svelte-1xx6whh" data-svelte-h="svelte-1qiptvl"><h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FloAI</h1> <p class="text-xl text-muted-foreground">Your intelligent virtual assistant for job matching and collaboration</p></div> ${validate_component(IntentSelector, "IntentSelector").$$render($$result, {}, {}, {})}</div>`}</div> </div>`;
});
export {
  Page as default
};
