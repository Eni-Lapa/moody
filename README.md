# Moody

A mood tracking web application built with Next.js, TypeScript, and modern React libraries.

## Features

- Track your daily moods with a simple, interactive UI
- View mood history and trends
- Responsive design
- Persistent storage (database-backed)
- Modern UI components

## Tech Stack

- [Next.js (App Router)](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Sonner](https://sonner.emilkowal.ski/) (for toasts/notifications)
- Custom React Context for state management

## Project Structure

```
moody/
  app/
    globals.css
    layout.tsx
    page.tsx
    providers.tsx
    api/
      database.ts
      migrations.ts
      days/
        route.ts
        [day]/
          route.ts
    services/
      mood.api.ts
  components/
    MoodBoard/
      MoodBoard.tsx
      MoodModal.tsx
      MoodTile.tsx
    ui/
      alert.tsx
      button.tsx
      dialog.tsx
      skeleton.tsx
      sonner.tsx
  constants/
    moods.ts
  contexts/
    MoodContext.tsx
  hooks/
    use-moods.ts
  lib/
    utils.ts
  public/
    ...
  scripts/
    init-db.ts
  tests/
    ...
  types/
    mood.types.ts
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in required values.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Database setup:**
   - Run the migration/init script:
     ```bash
     npm run db:init
     ```

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run db:init` — Initialize or migrate the database

## License

MIT
