# Weekly Mood Tracker

A Next.js application for tracking your daily moods throughout the week with an optimistic UI and persistent storage.

## 📋 Features

- **7-Day Mood Board**: Track moods for each day of the week (Monday-Sunday)
- **6 Mood Options**: Happy, Tired, Focused, Stressed, Relaxed, Neutral
- **Optimistic UI**: Instant feedback with background server synchronization
- **Persistent Storage**: SQLite database that survives page reloads
- **Keyboard Accessible**: Full keyboard navigation support (Esc to close modal)
- **Error Handling**: Non-blocking error notifications with retry options
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Database**: SQLite (via sqlite3)
- **State Management**: React Context API

## 📦 Prerequisites

- Node.js 18.18.0 or higher
- npm, yarn, or pnpm

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize the Database

The application uses SQLite for data persistence. Initialize the database with:

```bash
npm run db:setup
```

This will create a `moods.db` file in the project root with the necessary tables and seed data.

**Optional**: To reset the database (deletes all data):

```bash
npm run db:reset
```

**Optional**: To verify the database setup:

```bash
npm run db:verify
```

## 🏃 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

Features in development mode:
- Hot module replacement (HMR)
- Fast refresh
- Detailed error messages
- Source maps

### Production Mode

#### Step 1: Build the Application

Compile and optimize the application for production:

```bash
npm run build
```

This will:
- Compile TypeScript
- Optimize bundles
- Generate static assets
- Create the `.next` build folder

#### Step 2: Start the Production Server

After building, start the production server:

```bash
npm start
```

The application will be available at **http://localhost:3000** (or the port specified in your environment).

Production mode features:
- Optimized performance
- Minified assets
- Server-side rendering (SSR)
- Production-grade error handling

## 📁 Project Structure

```
moody/
├── app/
│   ├── api/                  # API routes
│   │   ├── database.ts       # Database connection
│   │   ├── migrations.ts     # Database schema & setup
│   │   ├── lib/
│   │   │   └── helpers.ts    # DB helper functions
│   │   └── days/
│   │       ├── route.ts      # GET /api/days
│   │       └── [day]/
│   │           └── route.ts  # PUT/PATCH /api/days/:day
│   ├── services/
│   │   └── mood.api.ts       # API client service
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # Context providers
├── components/
│   ├── MoodBoard/
│   │   ├── MoodBoard.tsx     # Main board component
│   │   ├── MoodModal.tsx     # Mood selection modal
│   │   └── MoodTile.tsx      # Individual day tile
│   └── ui/                   # Reusable UI components
├── constants/
│   └── moods.ts              # Mood definitions & colors
├── contexts/
│   └── MoodContext.tsx       # Global state management
├── hooks/
│   └── use-moods.ts          # Custom mood hook
├── lib/
│   └── utils.ts              # Utility functions
├── scripts/
│   └── init-db.ts            # Database initialization script
├── types/
│   └── mood.types.ts         # TypeScript type definitions
└── moods.db                  # SQLite database (created after setup)
```

## 🎯 API Endpoints

### GET `/api/days`
Retrieves all days with their current moods.

**Response:**
```json
[
  { "day": "monday", "mood": "happy" },
  { "day": "tuesday", "mood": null },
  ...
]
```

### PUT `/api/days/:day`
Updates the mood for a specific day.

**Request Body:**
```json
{
  "mood": "happy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "day": "monday",
    "mood": "happy"
  }
}
```

**Note**: The API includes artificial latency (300-1200ms) to simulate real-world server conditions.

## 🎨 Available Moods

| Mood     | Emoji | Color Code |
|----------|-------|------------|
| Happy    | 🙂    | #FACC15    |
| Tired    | 😪    | #60A5FA    |
| Focused  | 🎯    | #14B8A6    |
| Stressed | 😖    | #EF4444    |
| Relaxed  | 🧘    | #A78BFA    |
| Neutral  | 😐    | #64748B    |

## 🔧 Available Scripts

| Command            | Description                                      |
|--------------------|--------------------------------------------------|
| `npm run dev`      | Start development server                         |
| `npm run build`    | Build for production                             |
| `npm start`        | Start production server (requires build first)   |
| `npm run lint`     | Run ESLint                                       |
| `npm run db:setup` | Initialize/setup database                        |
| `npm run db:reset` | Reset database (deletes all data)                |
| `npm run db:verify`| Verify database structure                        |

## 🏗️ Technical Implementation Notes

### Optimistic UI Pattern
The application implements optimistic UI updates:
1. **Immediate Update**: UI updates instantly when user selects a mood
2. **Background Sync**: Server request fires in the background
3. **Reconciliation**: Server response (authoritative) updates the UI
4. **Error Recovery**: Failed updates revert to previous state with error notification

### Out-of-Order Response Handling
Requests are timestamped to handle race conditions. Only the most recent request for each day is applied, preventing stale responses from overwriting newer data.

### State Management
- **Server State**: Stored in SQLite database
- **Client State**: Managed via React Context
- **Optimistic State**: Temporary overlay until server confirms

### Persistence
The SQLite database file (`moods.db`) persists data across server restarts. The database is automatically created when running `npm run db:setup`.

## 🐛 Troubleshooting

### Database Issues

**Problem**: Database not found or empty
**Solution**: Run `npm run db:setup` to initialize the database

**Problem**: Corrupt database
**Solution**: Run `npm run db:reset` to reset and recreate the database

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
# or
PORT=3001 npm start
```

### Build Errors

If you encounter build errors, try:
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

## 📝 Environment Variables

No environment variables are required for basic functionality. The database path defaults to `moods.db` in the project root.

## 🧪 Testing the Application

1. **Select a mood**: Click any day tile to open the mood selector
2. **Change moods**: Click different moods rapidly to test optimistic UI
3. **Reload page**: Refresh to verify persistence
4. **Keyboard navigation**: Use Tab to navigate, Enter to select, Esc to close
5. **Error handling**: Stop the dev server briefly to test error recovery

## 📄 License

MIT

---

**Developed as part of a Next.js Developer Task**