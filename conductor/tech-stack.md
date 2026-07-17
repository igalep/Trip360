# Technology Stack

This document details the languages, libraries, databases, and architectures used in the Trip Budget Tracker App.

## 1. Frontend Core
- **Framework**: React 19.2
- **Build Tool**: Vite 8.1
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS with modern custom variables and nesting features.

## 2. Backend & API Services
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Wildcard Function**: Deployed as Vercel Serverless Functions under `api/index.ts`.
- **Validation**: Zod (all request payloads, params, and queries validated).

## 3. Database Layer
- **Database**: Turso DB / libSQL
- **Client Library**: `@libsql/client`
- **Development Fallback**: Local SQLite database `file:dev.db` when environmental variables are absent.
