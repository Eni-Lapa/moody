# Weekly Mood Tracker

A Next.js application for tracking daily moods with optimistic UI updates and persistent storage.

## Features

- 7-day mood board with 6 mood options (Happy, Tired, Focused, Stressed, Relaxed, Neutral)
- Optimistic UI with instant feedback
- SQLite database persistence
- Keyboard accessible (Tab, Enter, Esc)
- Responsive design

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Radix UI
- SQLite database
- React Context for state management

## Quick Start

### Prerequisites
- Node.js 18.18.0 or higher

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development (auto-initializes database if needed)
npm run start:dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
# Build with automatic database initialization
npm run start:build

# Start production server
npm start
```

## Project Structure

```
moody/
├── app/
│   ├── api/              # API routes & database
│   └── services/         # API client
├── components/           # React components
├── contexts/             # State management
├── constants/            # Mood definitions
├── types/                # TypeScript types
├── lib/
│   ├── db/              # Database queries & connection
│   └── utils/           # Helper functions
└── scripts/             # Database & startup scripts
```

## API Endpoints

**GET `/api/days`** - Fetch all days with moods

**PUT/PATCH `/api/days/:day`** - Update mood for a day
```json
{ "mood": "happy" }
```

*Note: API includes 300-1200ms artificial latency for testing.*

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | **Recommended**: Auto-check DB + start dev server |
| `npm run start:build` | **Recommended**: Auto-check DB + build for production |
| `npm run dev` | Start development server only |
| `npm run build` | Build for production only |
| `npm start` | Start production server |
| `npm run db:init` | Initialize database manually |
| `npm run db:setup` | Setup database with options |
| `npm run db:reset` | Reset database |
| `npm run db:verify` | Verify database status |

## Key Implementation Details

**Optimistic UI Pattern**
- Instant UI updates while syncing in background
- Timestamp-based race condition handling
- Automatic error recovery with rollback

**Database Persistence**
- SQLite stores moods across server restarts
- Automatic schema creation and seeding on first run
- ACID-compliant transactions

**Smart Startup Scripts**
- Automatic database initialization on first run
- Cross-platform compatibility (Windows, Mac, Linux)
- No manual setup required for new developers

## Testing

1. Select moods on different days
2. Refresh page to verify persistence
3. Rapid-click tiles to test race conditions
4. Use keyboard (Tab/Enter/Esc) for navigation

## Troubleshooting

**Database not found**: Use `npm run start:dev` (auto-initializes) or manually run `npm run db:init`

**Port 3000 in use**: Set custom port with `PORT=3001 npm run start:dev`

**Build errors**: Delete `.next` and `node_modules`, then reinstall

---

**Developed for Next.js Developer Task**