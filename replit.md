# DivvyPlan

## Overview

DivvyPlan is a UK-focused "deal-to-dividends" planning calculator for small company directors. Users enter a client deal/invoice amount, and the app calculates VAT (if applicable), Corporation Tax at 25%, the available dividend pool, per-director splits, and personal dividend tax estimates. This is an internal planning tool only — not tax advice.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Vite + React + TypeScript single-page application
- **UI Library**: Material UI (MUI) following Material 3 design principles
- **Styling**: Tailwind CSS with custom CSS variables for theming, plus shadcn/ui components
- **State Management**: React useState/useEffect with LocalStorage persistence
- **Testing**: Vitest for unit testing calculation logic

### Core Design Patterns
- **Separation of Concerns**: All calculation logic lives in pure functions in `client/src/lib/calc.ts` for testability
- **Money Handling**: Dedicated `client/src/lib/money.ts` module converts amounts to pence internally to avoid floating-point errors
- **Persistence**: Settings and app state saved to LocalStorage (no backend database required for core functionality)
- **Component Structure**: Feature-based components in `client/src/components/` with reusable UI primitives in `client/src/components/ui/`

### Backend Architecture
- **Server**: Express.js with HTTP server in `server/index.ts`
- **Routing**: API routes registered in `server/routes.ts` (currently minimal, app is primarily client-side)
- **Storage**: In-memory storage interface in `server/storage.ts` with potential for database integration
- **Static Serving**: Production builds served from `dist/public`

### Build System
- **Development**: Vite dev server with HMR
- **Production**: Custom build script using esbuild for server bundling and Vite for client
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Key Calculation Assumptions (displayed in UI)
- Expenses are ignored (profit equals net sales)
- Corporation Tax treated as flat rate (default 25%)
- Dividend tax treated as single effective rate chosen by user (no banding across thresholds)

## External Dependencies

### Database
- **Drizzle ORM**: Schema defined in `shared/schema.ts` with PostgreSQL dialect configured
- **PostgreSQL**: Database connection via `DATABASE_URL` environment variable (optional - app works without it using in-memory storage)

### UI Libraries
- **Material UI (@mui/material)**: Primary component library
- **Radix UI**: Underlying primitives for shadcn/ui components
- **Tailwind CSS**: Utility-first styling

### State & Data
- **TanStack Query**: Available for server state management (configured in `client/src/lib/queryClient.ts`)
- **React Hook Form + Zod**: Form handling and validation
- **LocalStorage**: Client-side persistence for settings and app state

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across client, server, and shared code