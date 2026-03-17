# Next.js Web Frontend

React + Next.js web application for JobApp.

## Setup

```bash
cd frontend/web
npm install
cp .env.example .env.local
```

## Development

```bash
npm run dev
```

Open http://localhost:3000 in browser.

## Build

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_VERSION=v1
```

## Project Structure

```
frontend/web/
├── src/
│   ├── pages/           # Next.js pages & routes
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service calls
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Global & component styles
├── public/              # Static assets
└── next.config.js
```

## Features

- Server-side rendering with Next.js
- Type-safe development with TypeScript
- State management with Zustand
- API client with Axios
- Authentication with JWT
- Responsive design with Tailwind CSS

## API Integration

All API calls go through `src/services/api.ts`:

```typescript
import { api } from '@/services/api';

// Get current user
const user = await api.getUser();

// Create job listing
const job = await api.createJob(jobData);
```

## Authentication

JWT token stored in localStorage. All requests include:
```
Authorization: Bearer <token>
```

See `src/hooks/useAuth.ts` for authentication logic.
