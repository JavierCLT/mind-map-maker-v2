# Deployment Runbook

This runbook covers Vercel + Supabase + Stripe deployment for:

- Frontend: `apps/frontend`
- Backend: `apps/backend`

## 1. Supabase Setup

1. Create a Supabase project.
2. In SQL Editor, run:
   - `apps/backend/docs/supabase-schema.sql`
3. In Authentication settings:
   - Enable Email/Password provider.
   - Configure allowed redirect URLs for your production domain and local dev.
4. Save:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Stripe Setup

1. Create a Product: `Mind Map Maker Pro`.
2. Create recurring monthly Price.
3. Save:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID_PRO_MONTHLY`
4. Add webhook endpoint:
   - URL: `https://<your-backend-domain>/stripe-webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
5. Save:
   - `STRIPE_WEBHOOK_SECRET`

## 3. Backend on Vercel

1. Create Vercel project from `apps/backend`.
2. Set environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (`gpt-4.1` default)
   - `OPENAI_BASE_URL` (optional)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID_PRO_MONTHLY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` (your frontend origin)
3. Deploy and verify:
   - `GET /` returns capabilities
   - `POST /generate-mindmap` requires bearer token
   - `POST /deep-dive` requires bearer token
   - `GET /me` returns account + usage

## 4. Frontend on Vercel

1. Create Vercel project from `apps/frontend`.
2. Set environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` = backend URL
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy and verify:
   - `/auth` sign-up/sign-in works
   - generation works while authenticated
   - saved maps list loads
   - deep dive actions work
   - quota paywall appears after free limit
   - checkout button opens Stripe session

## 5. Post-Deploy Validation Checklist

1. Create a new user and sign in.
2. Generate first map and confirm it appears under Saved Maps.
3. Open Map Details, rename, duplicate, and delete.
4. Run a deep dive action on selected node.
5. If on free plan, hit quota and verify paywall modal appears.
6. Upgrade to Pro and verify:
   - Stripe checkout succeeds
   - webhook updates `profiles.plan = pro`
   - unlimited generation works
7. Open billing portal and confirm cancel/update flow works.

## 6. Known Operational Notes

- Webhook security:
  - In production, backend rejects unsigned webhooks if `STRIPE_WEBHOOK_SECRET` is missing.
- Quota source:
  - Monthly usage is based on rows in `mindmaps` for current month.
- Vercel routing:
  - Custom routes are declared in `apps/backend/vercel.json`.
