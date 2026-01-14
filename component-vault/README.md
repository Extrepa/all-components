# Component Vault

AI-powered web component archiver and library system.

## Overview

Component Vault crawls websites, extracts UI components, analyzes them with AI, and stores them in a searchable library. It can convert HTML to React and generate documentation automatically.

## Tech Stack

- **Next.js 14** - App Router
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Job queue
- **BullMQ** - Queue management
- **Playwright** - Web crawling
- **OpenAI** - Component analysis and React conversion
- **Cheerio** - HTML parsing

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Edit `.env`:
```env
DATABASE_URL="postgresql://errl:errlpassword@localhost:5432/component_vault?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
OPENAI_API_KEY="sk-your-key-here"
```

### 3. Start Docker Services
```bash
docker-compose up -d
```

### 4. Set Up Database
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run Development Servers

Terminal 1 - Main App:
```bash
npm run dev
```

Terminal 2 - Worker:
```bash
npm run worker
```

### 6. Use the App
1. Open http://localhost:3000
2. Enter a URL in the ingest form
3. Worker will crawl and extract components
4. View components in Library page

## Features

- **Web Crawling** - Automatically crawl and snapshot pages
- **Component Extraction** - Detect and extract UI components
- **AI Analysis** - Generate documentation and explanations
- **React Conversion** - Convert HTML to React components
- **Search & Filter** - Find components by type, tags, or search
- **Favorites** - Save important components
- **Code Generation** - Export React code for components

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Dashboard (ingest form)
│   ├── library/      # Component library
│   └── sites/        # Site management
├── components/       # React UI components
├── lib/
│   ├── ai/          # OpenAI integration
│   ├── core/        # Crawler and analyzer
│   ├── db/          # Prisma client
│   └── queue/       # BullMQ setup
└── prisma/          # Database schema
```

## API Endpoints

- `POST /api/ingest` - Add URL to crawl queue
- Library pages show extracted components
- Individual component pages show details and code

## Troubleshooting

**Database connection error:**
- Check Docker containers: `docker ps`
- Verify DATABASE_URL in .env

**Worker not processing:**
- Check Redis is running: `docker ps | grep redis`
- Check worker terminal for errors

**OpenAI errors:**
- Verify OPENAI_API_KEY is set
- Check API key is valid and has credits

## Deployment

See `SETUP_GUIDE.md` for detailed deployment instructions.

## License

Private project.

