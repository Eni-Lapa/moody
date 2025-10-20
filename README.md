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

# 2. Initialize database
npm run db:setup

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
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
└── scripts/              # Database setup
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
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:setup` | Initialize database |
| `npm run db:reset` | Reset database |

## Key Implementation Details

**Optimistic UI Pattern**
- Instant UI updates while syncing in background
- Timestamp-based race condition handling
- Automatic error recovery with rollback

**Database Persistence**
- SQLite stores moods across server restarts
- Automatic schema creation and seeding
- ACID-compliant transactions

## Testing

1. Select moods on different days
2. Refresh page to verify persistence
3. Rapid-click tiles to test race conditions
4. Use keyboard (Tab/Enter/Esc) for navigation

## Troubleshooting

**Database not found**: Run `npm run db:setup`

**Port 3000 in use**: Set custom port with `PORT=3001 npm run dev`

**Build errors**: Delete `.next` and `node_modules`, then reinstall

---

**Developed for Next.js Developer Task**