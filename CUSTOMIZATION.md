# Customizing FloAI Bot Behavior

There are **two main ways** to customize how Flo's AI assistant behaves:

## 1. 🧠 System Prompts (Code-based)

**Location:** `src/lib/openai.ts`

The system prompts define the AI's personality and behavior. You can customize:

### Current Personality Settings

- **Temperature**: `0.9` (higher = more creative/varied responses)
- **Presence Penalty**: `0.3` (encourages diverse topics)
- **Frequency Penalty**: `0.3` (reduces repetition)

### Intent-Specific Behavior

Each intent has its own personality:

- **Hire**: Friendly, professional, enthusiastic
- **Partner**: Open, creative, solution-oriented  
- **Fun**: Witty, playful, personable
- **Newsletter**: Friendly, informative, welcoming

### How to Customize

Edit the `personalityPrompts` object in `src/lib/openai.ts`:

```typescript
const personalityPrompts: Record<string, string> = {
  hire: `Your custom instructions here...`,
  partner: `Your custom instructions here...`,
  fun: `Your custom instructions here...`,
  newsletter: `Your custom instructions here...`
};
```

**Tips:**
- Be specific about tone (e.g., "casual", "professional", "witty")
- Define what NOT to do (e.g., "avoid corporate jargon")
- Set response length preferences
- Define personality traits

## 2. 📚 Knowledge Base (RAG System) - **RECOMMENDED**

**Location:** Admin Dashboard → `/admin` → Knowledge Base tab

This is the **easiest and most powerful** way to customize behavior without touching code!

### How It Works

1. Go to `/admin` → Knowledge Base tab
2. Click "Add Document"
3. Add documents about:
   - Flo's personality and communication style
   - How Flo likes to work
   - Flo's background and interests
   - Response guidelines
   - Examples of how Flo communicates

### Example Knowledge Base Documents

**Document 1: "Flo's Communication Style"**
```
Flo communicates in a casual, friendly manner. Uses contractions and natural language.
Prefers short, punchy sentences over long paragraphs. Often uses humor and emojis in casual contexts.
Professional but never stuffy. Values authenticity over formality.
```

**Document 2: "Flo's Background"**
```
Flo is a full-stack developer with 5+ years of experience in AI/ML and web development.
Passionate about building products that solve real problems. Enjoys collaborating with creative teams.
Based in [location]. Loves [interests]. Previous work includes [projects].
```

**Document 3: "Response Guidelines"**
```
When discussing job matches:
- Focus on genuine fit, not just skills
- Mention specific projects or experiences
- Be honest about gaps
- Show enthusiasm for learning opportunities

When chatting casually:
- Match the user's energy level
- Use appropriate humor
- Keep it light unless the topic is serious
```

### Why Knowledge Base is Better

✅ **No code changes needed** - Update via admin dashboard  
✅ **Easy to iterate** - Test different approaches quickly  
✅ **Context-aware** - Different knowledge used for different queries  
✅ **Version control** - Can track changes over time  

## 3. 🔧 Advanced: Temperature & Model Settings

**Location:** `src/lib/openai.ts` → `generateConversationResponse()`

### Current Settings:
```typescript
temperature: 0.9,        // 0.0-2.0 (higher = more creative)
presence_penalty: 0.3,  // -2.0 to 2.0 (encourages new topics)
frequency_penalty: 0.3  // -2.0 to 2.0 (reduces repetition)
```

### Adjusting for Different Behavior:

**More Creative/Unpredictable:**
```typescript
temperature: 1.2
presence_penalty: 0.5
```

**More Consistent/Focused:**
```typescript
temperature: 0.7
presence_penalty: 0.1
```

**More Formal:**
```typescript
temperature: 0.6
// Update personality prompts to be more formal
```

## Quick Start: Make It Less "Strict"

1. **Increase Temperature** (already done - set to 0.9)
2. **Add Knowledge Base Document** with personality guidelines:
   - Go to `/admin` → Knowledge Base
   - Add: "Flo's Personality: Casual, friendly, authentic. Uses natural language and contractions. Not overly formal."
3. **Update System Prompts** in `src/lib/openai.ts` if needed

## Testing Changes

1. Make changes to code or knowledge base
2. Restart dev server: `npm run dev`
3. Test in different intents
4. Check what knowledge base documents are being retrieved (they're logged)

## Need Help?

- Check browser console for which knowledge base docs are being used
- Review server logs to see the full system prompt being sent
- Test with different intents to see behavior differences
