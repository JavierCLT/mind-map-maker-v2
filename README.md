# Mind Map Maker V2

Single-repository setup for the production-grade Mind Map Maker platform.

## Structure

- `apps/frontend`: Next.js app (UI, auth, deep-dive, export, paywall UX)
- `apps/backend`: Vercel serverless API (OpenAI generation, deep-dive, accounts, billing, webhooks)
- `docs`: deployment and environment runbooks

## Quick Start

1. Backend
   - `cd apps/backend`
   - Create `.env` from `docs/env-example.txt`
   - `npm install`
   - `npm run dev`
2. Frontend
   - `cd apps/frontend`
   - Create `.env.local` from `.env.example`
   - `npm install --legacy-peer-deps`
   - `npm run dev`

## Core Product Capabilities

- AI-generated comprehensive mind maps
- Node-level deep dives (`expand`, `explain`, `compare`, `plan`, `sources`)
- User auth + saved maps
- Free plan quota (3 maps/month) + Pro unlimited
- Stripe checkout + billing portal + webhook subscription sync

## Deployment

See `docs/deployment-runbook.md`.
