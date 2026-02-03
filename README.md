# FloAI - Virtual Assistant for Job Matching

An immersive conversational AI assistant powered by OpenAI that helps analyze job matches, explore partnerships, and engage in fun conversations.

## Features

- 🎯 **Job Matching Analysis**: Upload PDF/DOCX, paste LinkedIn/Indeed URLs, or type job descriptions to get matching rate analysis
- 💼 **Multiple Intents**: Hire Flo, Partner for Projects, Fun Chat, Newsletter Subscription
- 🧠 **RAG-Powered Responses**: Knowledge base system that guides AI responses using your documents
- 🎤 **Voice Input/Output**: Speech recognition (Web Speech API) and text-to-speech (ElevenLabs)
- 💾 **Conversation History**: Persistent storage of all conversations in PostgreSQL
- 📊 **Admin Dashboard**: View sessions, analytics, manage knowledge base, export conversations
- 📧 **Newsletter Integration**: Free Resend integration for subscriber management
- 🎨 **Immersive UI**: Beautiful, modern interface with smooth animations

## Tech Stack

- **Frontend/Backend**: SvelteKit (deployed on Vercel)
- **Database**: PostgreSQL (via Vercel Postgres) with Prisma ORM
- **AI**: OpenAI GPT-4 Turbo with RAG (Retrieval Augmented Generation)
- **Voice**: ElevenLabs API + Web Speech API
- **Job Parsing**: pdf-parse, mammoth, cheerio
- **Newsletter**: Resend (free tier: 3,000 emails/month)
- **Styling**: Tailwind CSS

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy `env.example` to `.env` and fill in:
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `DATABASE_URL`: Your PostgreSQL connection string (required)
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional, for voice synthesis)
- `ELEVENLABS_VOICE_ID`: Your ElevenLabs voice ID (optional, default male voice)
- `RESEND_API_KEY`: Your Resend API key (optional, for newsletter)
- `RESEND_FROM_EMAIL`: Your verified email domain (optional)
- `PUBLIC_APP_URL`: Your app URL (for production)

3. **Set up database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Run development server**:
```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Connect Vercel Postgres database
5. Deploy!

## Project Structure

```
src/
├── lib/
│   ├── components/        # Svelte components (UI)
│   │   ├── AdminDashboard.svelte
│   │   ├── AnalyticsView.svelte
│   │   ├── KnowledgeBaseManager.svelte
│   │   └── SessionsList.svelte
│   ├── db.ts             # Prisma client
│   ├── openai.ts         # OpenAI integration with RAG
│   ├── rag.ts            # RAG system (embeddings, semantic search)
│   ├── jobParser.ts      # Job description parsing (PDF, DOCX, URLs)
│   ├── newsletter.ts     # Resend newsletter integration
│   ├── voice.ts          # Voice synthesis/recognition
│   └── types.ts          # TypeScript types
├── routes/
│   ├── api/
│   │   ├── chat/         # Chat endpoint
│   │   ├── parse-job/    # Job parsing endpoint
│   │   ├── newsletter/   # Newsletter subscription
│   │   └── admin/        # Admin APIs (sessions, analytics, knowledge)
│   ├── admin/            # Admin dashboard
│   └── +page.svelte      # Main page
└── app.css               # Global styles
```

## Key Features Explained

### RAG System (Knowledge Base)
Add documents via `/admin` → Knowledge Base tab. These documents guide Flo's responses using semantic search. The system:
1. Generates embeddings for your documents
2. Retrieves relevant documents based on user queries
3. Includes them in AI context for consistent responses

### Job Description Parsing
Supports multiple formats:
- **PDF**: Upload PDF files directly
- **DOCX**: Upload Word documents
- **URLs**: Paste LinkedIn/Indeed job links (auto-scrapes)
- **Text**: Direct text input

### Admin Dashboard
Access at `/admin`:
- **Analytics**: View conversation stats, export data
- **Sessions**: Browse all conversations, filter by intent
- **Knowledge Base**: Manage RAG documents

## Next Steps

- [x] ✅ Job description parsing (PDF, DOCX, URL scraping)
- [x] ✅ RAG system for knowledge base
- [x] ✅ Admin dashboard with analytics
- [x] ✅ Conversation export (CSV/JSON)
- [x] ✅ Newsletter integration
- [ ] Add audio file storage (S3/Cloudflare R2) for production
- [ ] Enhance voice cloning with custom voice samples
- [ ] Add user profile management UI
