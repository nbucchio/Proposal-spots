# Proposal Spots — Partner Intake Form

Conditional intake form for partners to submit Proposal Spots listings
directly into Airtable (Proposal Spots + Packages tables).

## Setup

```bash
npm install
```

Create a `.env.local` file (not committed) with:

```
AIRTABLE_API_KEY=your_personal_access_token
AIRTABLE_BASE_ID=appyZ3CKlGqvHjpWp
```

`AIRTABLE_BASE_ID` above points at the SANDBOX base
("Proposal Spots (Copy)"). Table and field IDs are identical between
the sandbox and production base (Airtable preserved them on
duplication), so promoting to production later is just swapping this
one value to the production base ID — no code changes needed.

Token scopes required: `data.records:read`, `data.records:write`,
`schema.bases:read`, restricted to only the base you're pointing at.

## Run locally

```bash
npm run dev
```

## Deploy

```bash
npx vercel deploy
```

This creates a new, separate Vercel project on first run — it will
NOT touch any existing project. After the first deploy, add the two
environment variables above in the Vercel dashboard for this new
project, then redeploy (Vercel will prompt you).

## What this form does

1. Partner fills out Spot details (name, country, vibe, availability,
   rain check, pricing model).
2. If Pricing Model = "Single Price" — Price + Add-ons fields appear
   inline, and the spot is saved as a single record with Status =
   Draft.
3. If Pricing Model = "Tiered" — the spot is saved first, then the
   partner is walked through adding 1–3 pricing tiers (The Moment /
   The Experience / The Unforgettable), each saved as its own linked
   record in the Packages table.
4. A "+ Add another spot" button resets the flow for partners with
   multiple listings.

New records are always saved as Status = Draft — nothing is
partner-published live automatically.
