# Quick Guide: How to Customize Bot Segues (Prompt Suggestions)

## What You Asked For

You wanted a way to modify bot behavior so it offers meaningful segues (clickable pills with next inferred prompts) that users can tap. You also wanted to know if a guideline document can be chained at any prompt.

## ✅ Solution Implemented

**Yes!** The bot now uses a **guideline document system** that chains to every prompt. Here's how it works:

## How to Customize Segues (3 Simple Steps)

### Step 1: Go to Admin Dashboard
Navigate to `/admin` → **Knowledge Base**

### Step 2: Add a Segue Guidelines Document
Click **"Add Document"** and create a document with:

- **Title:** `Segue Guidelines - Prompt Suggestions` 
  - (Must contain "segue guidelines" for the bot to find it)
  
- **Category:** `guidelines` (optional but helpful)

- **Content:** Your custom guidelines (see example below)

### Step 3: Save and Test
Click **"Save"** - the bot will automatically use these guidelines!

## Example Segue Guidelines Document

Copy this template and customize it:

```
When generating segue prompts, follow these guidelines:

FOR "HIRE" INTENT:
- Focus on Flo's specific skills and experience
- Suggest questions about work style, availability, or past projects
- Examples: "Tell me about Flo's AI experience", "What's Flo's work style?", "Show me Flo's portfolio"

FOR "PARTNER" INTENT:
- Emphasize collaboration opportunities
- Suggest exploring project ideas
- Examples: "What projects interest Flo?", "How does Flo collaborate?", "Tell me about availability"

FOR "FUN" INTENT:
- Keep it casual and engaging
- Suggest interesting topics
- Examples: "What does Flo do for fun?", "Tell me something interesting", "What's Flo's favorite project?"

GENERAL RULES:
- Keep segues short (5-10 words max)
- Make them specific and actionable
- Use natural, conversational language
- Don't repeat what was just discussed
```

## How It Works

1. **RAG Integration**: The bot automatically retrieves documents with "segue guidelines" in the title
2. **Chains to Every Prompt**: These guidelines are included in the system prompt for every conversation
3. **Intent-Aware**: Segues adapt based on the current intent (hire/partner/fun/newsletter)
4. **Contextual**: Segues are generated based on the conversation context

## Where Segues Appear

After each bot response, you'll see **clickable pills** (segues) below the message. Users can tap them to instantly send that prompt.

## Customization Options

### Option 1: Update Guidelines Document (Easiest)
- Edit your segue guidelines document in the Knowledge Base
- Changes take effect immediately

### Option 2: Modify System Prompts
- Edit `src/lib/openai.ts` 
- Look for the segue generation system prompt (around line 160)

### Option 3: Change Segue Appearance
- Edit `src/lib/components/SeguePills.svelte`
- Customize colors, layout, number of segues shown

## Testing

1. Start a conversation with the bot
2. After each response, check for segue pills
3. Click a segue to test
4. Verify segues match your guidelines

## Files Changed

- ✅ `src/lib/openai.ts` - Added segue generation with RAG integration
- ✅ `src/lib/types.ts` - Added segues to Message metadata
- ✅ `src/routes/api/chat/+server.ts` - Returns segues in API response
- ✅ `src/lib/components/SeguePills.svelte` - New component for displaying segues
- ✅ `src/lib/components/MessageBubble.svelte` - Shows segues after assistant messages
- ✅ `src/lib/components/ConversationInterface.svelte` - Handles segue clicks

## Summary

**To customize segues:**
1. ✅ Add a "Segue Guidelines" document to Knowledge Base (`/admin`)
2. ✅ Bot automatically chains this document to every prompt
3. ✅ Segues appear as clickable pills after each response
4. ✅ Users can tap segues to continue conversation

**The guideline document IS chained at every prompt** - that's exactly what you asked for! 🎉
