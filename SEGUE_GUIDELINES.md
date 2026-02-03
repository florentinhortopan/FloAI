# Segue Guidelines - Customizing Bot Prompt Suggestions

## What are Segues?

Segues are **clickable prompt suggestions** (pills) that appear after each bot response. They help guide conversations by offering natural next steps that users can tap to continue the conversation.

## How Segues Work

1. **Automatic Generation**: After each bot response, the AI generates 2-4 contextually relevant segue prompts
2. **RAG Integration**: Segues are guided by your knowledge base documents tagged with "segue guidelines"
3. **Intent-Aware**: Segues adapt to the current conversation intent (hire, partner, fun, newsletter)
4. **Clickable**: Users can tap segues to instantly send that prompt

## Customizing Segue Behavior

### Method 1: Add Segue Guidelines to Knowledge Base (Recommended)

Add a document to your Knowledge Base with the title containing "segue guidelines" or "prompt suggestions". This document will guide how segues are generated.

**Example Segue Guidelines Document:**

**Title:** `Segue Guidelines - Prompt Suggestions`

**Content:**
```
When generating segue prompts, follow these guidelines:

FOR "HIRE" INTENT:
- Focus on Flo's specific skills and experience
- Suggest questions about Flo's work style, availability, or past projects
- Offer to dive deeper into specific technical skills
- Examples: "Tell me about Flo's experience with AI", "What's Flo's work style?", "Show me Flo's portfolio"

FOR "PARTNER" INTENT:
- Emphasize collaboration opportunities
- Suggest exploring project ideas or shared interests
- Offer to discuss timelines, scope, or approach
- Examples: "What kind of projects interest Flo?", "How does Flo approach collaboration?", "Tell me about Flo's availability"

FOR "FUN" INTENT:
- Keep it casual and engaging
- Suggest interesting topics about Flo's interests or hobbies
- Offer fun facts or stories
- Examples: "What does Flo do for fun?", "Tell me something interesting about Flo", "What's Flo's favorite project?"

FOR "NEWSLETTER" INTENT:
- Focus on what subscribers will get
- Suggest topics Flo covers
- Offer to explain the newsletter format
- Examples: "What topics does Flo cover?", "How often does Flo send newsletters?", "What's in the latest newsletter?"

GENERAL RULES:
- Keep segues short (5-10 words max)
- Make them specific and actionable
- Use natural, conversational language
- Don't repeat what was just discussed
- Vary the types of segues (questions vs statements)
- Make them feel like natural conversation continuations
```

### Method 2: Modify System Prompts

Edit `src/lib/openai.ts` to customize how segues are generated. Look for the system prompt that includes segue instructions around line 160-170.

### Method 3: Update Segue Guidelines Document

The bot automatically retrieves knowledge base documents when generating segues. Update your segue guidelines document in the admin dashboard to change behavior.

## Adding Segue Guidelines via Admin Dashboard

1. Go to `/admin` → Knowledge Base
2. Click "Add Document"
3. **Title:** `Segue Guidelines - Prompt Suggestions` (must contain "segue guidelines")
4. **Category:** `guidelines` (optional but helpful)
5. **Content:** Paste your custom segue guidelines (see example above)
6. Click "Save"

The bot will automatically use these guidelines when generating segues.

## How Segues Are Generated

1. Bot generates a response using RAG and personality prompts
2. Bot retrieves segue guidelines from knowledge base (if available)
3. Bot generates 2-4 segue prompts based on:
   - Current conversation context
   - Intent (hire/partner/fun/newsletter)
   - Segue guidelines from knowledge base
   - Natural conversation flow
4. Segues are returned as JSON and displayed as clickable pills

## Customizing Segue Appearance

Edit `src/lib/components/SeguePills.svelte` to customize:
- Colors and styling
- Number of segues shown
- Layout (horizontal, vertical, etc.)

## Examples of Good Segues

✅ **Good:**
- "Tell me more about Flo's AI projects"
- "What's Flo's availability?"
- "Show me Flo's portfolio"
- "How does Flo approach collaboration?"

❌ **Bad:**
- "Tell me more" (too vague)
- "What else?" (not specific)
- "Continue" (not conversational)
- "Tell me about Flo's experience with AI and machine learning and deep learning" (too long)

## Testing Segues

1. Start a conversation with the bot
2. After each bot response, check for segue pills below the message
3. Click a segue to test if it sends correctly
4. Verify segues are contextually relevant

## Troubleshooting

**Segues not appearing?**
- Check that the bot response includes `segues` in metadata
- Verify the API is returning segues (check browser console)
- Ensure `MessageBubble.svelte` includes the `SeguePills` component

**Segues not relevant?**
- Update your segue guidelines document in the knowledge base
- Make sure the document title contains "segue guidelines"
- Check that the knowledge base retrieval is working

**Want different segues?**
- Modify the segue guidelines document
- Update the system prompt in `src/lib/openai.ts`
- Adjust the segue generation logic

## Advanced: Custom Segue Logic

For advanced customization, edit `src/lib/openai.ts`:

1. Modify the system prompt that generates segues (around line 160)
2. Change the JSON response format
3. Adjust the number of segues (currently 2-4)
4. Add custom filtering or ranking logic

## Summary

**To customize segues:**
1. ✅ Add a "Segue Guidelines" document to your Knowledge Base via `/admin`
2. ✅ The bot automatically uses these guidelines when generating segues
3. ✅ Segues appear as clickable pills after each bot response
4. ✅ Users can tap segues to continue the conversation

That's it! The RAG system automatically chains your guideline documents to guide segue generation.
