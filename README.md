# UpKeep - Your Social Universe

A social management app that aggregates your relationships across platforms into one beautiful, spatial interface. Stay connected with the people who matter.

## Features

- **Constellation UI**: Visualize your network as a living solar system
- **Relationship Tracking**: Get nudges to stay in touch with important people
- **Platform Integration**: Connect YouTube, GitHub, Twitch, and more
- **AI-Powered Search**: Ask natural language questions about your network
- **Signal Feed**: See activity from your network in real-time
- **Pinned Content**: Watch streams while browsing other updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth
- **AI**: OpenAI GPT-4
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- Google Cloud Console project (for YouTube OAuth)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/upkeep.git
cd upkeep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up the database:
   - Go to your Supabase project
   - Open the SQL Editor
   - Run the contents of `schema.sql`

5. Configure Google OAuth:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials (Web application)
   - Add redirect URI: `http://localhost:3000/api/auth/youtube/callback`
   - Enable the Google provider in Supabase Auth settings

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google/YouTube OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
upkeep/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with constellation UI
│   ├── integrations/      # Platform connection page
│   └── api/               # API routes
│       ├── auth/          # OAuth handlers
│       ├── signals/       # Signal aggregation
│       ├── contacts/      # Contact management
│       └── ai/            # AI search & summarize
├── components/            # React components
│   ├── Constellation.tsx  # Main orbital UI
│   ├── SignalFeed.tsx    # Activity feed
│   ├── RelationshipNudges.tsx
│   └── ...
├── lib/                   # Utilities
│   ├── supabase.ts       # Database client
│   ├── openai.ts         # AI client
│   ├── platforms/        # Platform adapters
│   └── types.ts          # TypeScript types
└── schema.sql            # Database schema
```

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel deploy
```

Don't forget to:
1. Add environment variables to Vercel
2. Update OAuth redirect URIs with your production URL
3. Run the database schema in Supabase

## License

MIT
