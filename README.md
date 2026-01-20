# Charlottetown Odd Jobs Marketplace

A hyperlocal odd jobs marketplace connecting elderly residents and families in Charlottetown/UPEI area with students and young workers for quick tasks like snow removal, moving help, yard work, and more.

## About

This MVP web application is designed to address the demographic mismatch in Prince Edward Island:
- **Growing senior population** (38,105 people aged 65+, expanding 3.4% annually) needing help with home maintenance
- **UPEI students and youth** (5,669+ enrolled students) seeking flexible income opportunities

## Features

- **Job Posting** - Seniors/families post tasks with description, location, time, and pay
- **Job Browsing** - Youth browse nearby jobs, filter by category, and accept tasks
- **Simple Profiles** - Basic info for both job posters and workers (no authentication for MVP)
- **Ratings & Reviews** - Post-job ratings to build trust in the community
- **Task Management** - Track job status from posted → accepted → completed

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: JSON file storage (MVP - will be replaced with real DB)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Bram-cat/elderly_pei_app.git
cd elderly_pei_app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
elderly_pei_app/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page (job feed)
│   ├── post-job/          # Job posting form
│   ├── job/[id]/          # Job detail page
│   ├── profile/[id]/      # Profile pages
│   ├── history/           # Job history & wallet
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Navigation header
│   └── ...               # Feature components
├── lib/                  # Utilities & helpers
│   ├── types.ts          # TypeScript interfaces
│   ├── storage.ts        # JSON file operations
│   ├── constants.ts      # Job categories, local data
│   └── utils.ts          # Helper functions
└── data/                 # JSON data files (MVP storage)
    ├── jobs.json
    ├── profiles.json
    └── reviews.json
```

## Local Context

### Charlottetown/UPEI Integration

- **Location**: Centered on UPEI campus (46.2382° N, 63.1311° W)
- **Service Radius**: ~10km (covers Charlottetown metro area)
- **Neighborhoods**: UPEI, Downtown, Brighton, West Royalty, East Royalty, Parkdale, Sherwood, Cornwall, Stratford

### Job Categories (Seasonal Priority)

- **Winter** (Dec-Mar): Snow Removal - featured prominently
- **Spring/Fall** (Apr-May, Sep-Nov): Yard Work
- **Year-round**: Moving Help, Furniture Assembly, Minor Repairs

### Pricing (Based on PEI minimum wage: $17/hour)

- Snow Removal: $50-150 (varies by driveway size)
- Moving Help: $25-40/hour
- Yard Work: $20-30/hour
- Assembly: $30-50 flat rate
- Repairs: $25-50 flat rate

## Development Roadmap

### Phase 1: Project Setup ✅
- Next.js initialization
- TypeScript configuration
- Tailwind CSS + shadcn/ui
- Base layout and navigation
- Data models and storage utilities

### Phase 2: Core Job Features (In Progress)
- Job posting form
- Job listing API routes
- Home page job feed
- Job detail page
- Accept/complete job functionality

### Phase 3: Profiles & Reviews
- Profile creation and display
- Youth and senior profile layouts
- Reviews system
- Rating calculation

### Phase 4: History & Polish
- Job history and wallet pages
- Favourites functionality
- Rebook feature
- Responsive design polish
- Seed data for demo
- Testing

## Future Enhancements (Post-MVP)

- Authentication (Clerk or NextAuth)
- Real database (Supabase, PostgreSQL)
- Real-time notifications
- Payment processing (Stripe Connect)
- SMS notifications for seniors
- Background checks for workers
- Insurance integration
- Geographic expansion
- Mobile apps (React Native)

## Contributing

This is an MVP project. Contributions are welcome once the core functionality is complete.

## License

Private repository - All rights reserved.

## Contact

For questions or feedback, please open an issue in the GitHub repository.

---

Built with ❤️ for the Charlottetown community
