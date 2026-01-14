# Project Structure Documentation

**Project:** component-vault
**Last Updated:** 2026-01-09

## Directory Structure

```
component-vault/
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── docker-compose.yml        # Docker services (PostgreSQL, Redis)
├── .gitignore                # Git ignore rules
├── .env                      # Environment variables (not in git)
├── README.md                 # Project overview
├── INDEX.md                  # Workspace index
├── PROJECT_STATUS.md         # Project status tracking
│
├── prisma/
│   └── schema.prisma         # Database schema definitions
│
└── src/
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Root layout component
    │   ├── page.tsx          # Dashboard (ingest form + site list)
    │   ├── globals.css       # Global styles
    │   ├── actions.ts        # Server actions (ingest, explain)
    │   │
    │   ├── api/
    │   │   └── ingest/
    │   │       └── route.ts  # API route for URL ingestion
    │   │
    │   ├── library/
    │   │   ├── page.tsx      # Component library listing page
    │   │   └── [id]/
    │   │       └── page.tsx  # Individual component detail page
    │   │
    │   └── sites/
    │       └── page.tsx      # Site management page
    │
    ├── components/           # React UI components
    │   ├── ingest-form.tsx   # URL ingestion form
    │   ├── sidebar.tsx       # Navigation sidebar
    │   ├── search-toolbar.tsx # Search and filter toolbar
    │   ├── favorite-button.tsx # Favorite toggle button
    │   ├── code-tabs.tsx     # Code display with tabs (HTML/React)
    │   └── sandboxed-preview.tsx # Component preview iframe
    │
    └── lib/                  # Shared libraries and utilities
        ├── ai/
        │   └── client.ts     # OpenAI API client wrapper
        │
        ├── core/
        │   ├── analyzer/
        │   │   ├── page-analyzer.ts # Main page analysis logic
        │   │   └── heuristics.ts   # Component detection heuristics
        │   └── crawler/
        │       └── worker.ts # BullMQ worker for crawling jobs
        │
        ├── db/
        │   └── prisma.ts     # Prisma client singleton
        │
        └── queue/
            └── crawler-queue.ts # BullMQ queue configuration
```

## File Organization

### Core Files

- **Configuration:** `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- **Entry Point:** Next.js App Router (`src/app/layout.tsx`, `src/app/page.tsx`)
- **Source Code:** `src/` - Application source files organized by feature

### Documentation

- **Root Documentation:** `README.md`, `INDEX.md`, `PROJECT_STATUS.md`
- **docs/ directory:** `docs/project-structure.md` (this file)

### Infrastructure

- **Database:** `prisma/schema.prisma` - Database schema
- **Docker:** `docker-compose.yml` - PostgreSQL and Redis services
- **Environment:** `.env` - Environment variables (not tracked in git)

### Build and Distribution

- **Next.js Build:** `.next/` directory (generated)
- **Node Modules:** `node_modules/` (excluded from git)
- **Database Data:** `postgres_data/`, `redis_data/` (Docker volumes)

## Key Directories

### `src/app/` - Next.js App Router

The App Router structure follows Next.js 14 conventions:

- **Layout Components:** `layout.tsx` provides root layout
- **Pages:** Route-based pages (`page.tsx` files)
- **Server Actions:** `actions.ts` contains server-side actions
- **API Routes:** `api/ingest/route.ts` handles URL ingestion
- **Dynamic Routes:** `library/[id]/page.tsx` for individual components

**Key Routes:**
- `/` - Dashboard with ingest form
- `/library` - Component library listing
- `/library/[id]` - Individual component detail page
- `/sites` - Site management page

### `src/components/` - React UI Components

Reusable React components for the UI:

- **Forms:** `ingest-form.tsx` - URL input and submission
- **Navigation:** `sidebar.tsx` - App navigation
- **Search:** `search-toolbar.tsx` - Component search and filtering
- **Interaction:** `favorite-button.tsx` - Favorite toggle
- **Display:** `code-tabs.tsx` - Code viewer with tabs
- **Preview:** `sandboxed-preview.tsx` - Sandboxed component preview

All components use TypeScript and Tailwind CSS for styling.

### `src/lib/core/analyzer/` - Component Analysis

Component detection and analysis logic:

- **page-analyzer.ts:** Main analysis orchestrator
  - Takes HTML and extracts components
  - Uses heuristics to identify component types
  - Detects framework usage (React, Tailwind)
  - Calculates complexity scores

- **heuristics.ts:** Component detection rules
  - Identifies component types (NAV, HERO, CARD, BUTTON, etc.)
  - Detects framework indicators
  - Pattern matching for common UI patterns

### `src/lib/core/crawler/` - Web Crawling

Worker process for crawling websites:

- **worker.ts:** BullMQ worker
  - Processes crawl jobs from queue
  - Uses Playwright to navigate and capture pages
  - Saves HTML, CSS, and screenshots
  - Triggers component analysis

### `src/lib/ai/` - AI Integration

OpenAI integration for component analysis:

- **client.ts:** OpenAI API wrapper
  - Sends components to OpenAI for analysis
  - Generates explanations and documentation
  - Converts HTML to React code
  - Returns structured analysis results

### `src/lib/db/` - Database Access

Prisma database client:

- **prisma.ts:** Singleton Prisma client instance
  - Type-safe database access
  - Used throughout the application

### `src/lib/queue/` - Job Queue

BullMQ queue configuration:

- **crawler-queue.ts:** Queue setup and management
  - Defines queue names and options
  - Configures Redis connection
  - Provides queue access functions

### `prisma/` - Database Schema

Prisma schema definitions:

**Models:**
- `SiteArchive` - Tracked websites
- `PageSnapshot` - Individual page captures
- `Component` - Extracted UI components
- `ExplanationDoc` - AI-generated component documentation

**Enums:**
- `CrawlStatus` - PENDING, PROCESSING, COMPLETED, FAILED
- `ComponentType` - NAV, HERO, CARD, BUTTON, SLIDER, EFFECT, FOOTER, UNKNOWN

## File Naming Conventions

- **React Components:** PascalCase (e.g., `IngestForm.tsx`, `CodeTabs.tsx`)
- **Utilities:** camelCase (e.g., `page-analyzer.ts`, `crawler-queue.ts`)
- **Pages:** lowercase with hyphens for directories (e.g., `library/[id]/page.tsx`)
- **Server Actions:** camelCase (e.g., `actions.ts`)
- **Configuration:** lowercase (e.g., `next.config.js`, `tsconfig.json`)

## Import/Export Structure

- **ES Modules:** All files use ES6 import/export syntax
- **TypeScript:** Full TypeScript support with type safety
- **Path Aliases:** Uses `@/` alias for `src/` directory
  - Example: `import prisma from '@/lib/db/prisma'`
- **Server Components:** Next.js App Router server components by default
- **Client Components:** Marked with `'use client'` directive when needed

## Database Schema

The Prisma schema defines the following relationships:

```
SiteArchive (1) ──< (many) PageSnapshot (1) ──< (many) Component (1) ── (1) ExplanationDoc
```

- One SiteArchive has many PageSnapshots
- One PageSnapshot has many Components
- One Component has one ExplanationDoc (optional)

## Architecture Patterns

1. **Server Actions:** Next.js server actions for mutations (`actions.ts`)
2. **API Routes:** REST API endpoints for external integration (`api/ingest/`)
3. **Job Queue:** BullMQ for background processing (crawling, analysis)
4. **Type Safety:** Full TypeScript throughout
5. **Component-Based UI:** React components with Tailwind CSS
6. **Database ORM:** Prisma for type-safe database access

## Development Workflow

1. **Ingest URL:** User submits URL via ingest form
2. **Queue Job:** URL added to BullMQ queue
3. **Worker Processes:** Worker crawls page with Playwright
4. **Save Snapshot:** HTML, CSS, screenshot saved to database
5. **Analyze Components:** Analyzer extracts components using heuristics
6. **AI Analysis:** Components sent to OpenAI for explanation and React conversion
7. **Store Results:** Components and explanations saved to database
8. **Display Library:** Components shown in searchable library interface
