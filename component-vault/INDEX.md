# Workspace Index

**Generated:** 2026-01-09
**Project:** component-vault
**Total Files:** ~100 (approximate, excluding node_modules)

## Directory Structure

```
component-vault/
├── package.json
├── docker-compose.yml
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard (ingest form)
│   │   ├── layout.tsx        # Root layout
│   │   ├── actions.ts        # Server actions
│   │   ├── globals.css       # Global styles
│   │   ├── library/
│   │   │   ├── page.tsx      # Component library listing
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Individual component page
│   │   ├── sites/
│   │   │   └── page.tsx      # Site management
│   │   └── api/
│   │       └── ingest/       # API route for ingestion
│   ├── components/
│   │   ├── ingest-form.tsx
│   │   ├── sidebar.tsx
│   │   ├── search-toolbar.tsx
│   │   ├── favorite-button.tsx
│   │   ├── code-tabs.tsx
│   │   └── sandboxed-preview.tsx
│   └── lib/
│       ├── ai/
│       │   └── client.ts     # OpenAI integration
│       ├── core/
│       │   ├── analyzer/
│       │   │   ├── page-analyzer.ts
│       │   │   └── heuristics.ts
│       │   └── crawler/
│       │       └── worker.ts # BullMQ worker
│       ├── db/
│       │   └── prisma.ts     # Prisma client
│       └── queue/
│           └── crawler-queue.ts # BullMQ queue setup
├── README.md
└── docs/
```

## File Categories

### Core Files
- **Configuration:** `package.json` - Project dependencies and scripts
- **Entry Point:** Next.js App Router (`src/app/`)
- **Source Code:** `src/` - Application source files
- **Database:** `prisma/schema.prisma` - Database schema definitions
- **Infrastructure:** `docker-compose.yml` - PostgreSQL and Redis services

### Documentation
- **README.md** - Project overview and documentation
- **docs/** - Detailed documentation (to be created)
- **Root Documentation:** Currently only README.md

### Build and Distribution
- **Configuration:** Next.js config, TypeScript config, Tailwind config
- **Database Migrations:** Prisma migration system

## Project Type
- **Type:** Web App (Full-stack)
- **Tech Stack:** 
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Prisma (PostgreSQL)
  - Redis + BullMQ (Job queue)
  - Playwright (Web crawling)
  - OpenAI (Component analysis)
  - Cheerio (HTML parsing)
  - Tailwind CSS

## Project Summary

Component Vault is an AI-powered web component archiver and library system. It crawls websites, extracts UI components, analyzes them with AI, and stores them in a searchable library. The system can automatically convert HTML to React components and generate documentation.

**Key Features:**
- Automated web crawling with Playwright
- AI-powered component extraction and analysis
- React code generation from HTML
- Searchable component library
- Favorites and tagging system
- Component preview with sandboxed iframe

## Quick Reference

- [README.md](README.md)
- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- [Documentation Index](docs/project-structure.md)

## Documentation Status

- **Category:** B
- **Root MD Files:** 1 (README.md)
- **Has README:** Yes
- **Has docs/ folder:** No (to be created)
- **Documentation Completeness:** 30% (has README, needs INDEX/PROJECT_STATUS/docs structure)
