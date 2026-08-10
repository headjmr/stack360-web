# Stack360 — Contact Form Backend Spec (for the deploy chat)

The landing page form (`#lead`) already POSTs JSON to **`/api/contact`** with a honeypot and
work-email validation, and shows loading / success / error states. This spec is the backend half.

## Data flow
`Landing form → POST /api/contact (Vercel serverless) → Supabase (store) + Resend (email info@stack360.ai)`

The browser never touches Supabase or Resend. The function uses the **service-role** key server-side,
so RLS stays fully closed to the public (SOC 2 aligned).

## Files in this repo
- `api/contact.js` — the serverless function (no npm deps; uses built-in fetch).
- `deploy/supabase_contact_leads.sql` — table + RLS. Run it in the Supabase SQL editor.
- `vercel.json` — clean URLs + security headers + long-cache for /assets and /fonts.

## Form JSON contract (what the function receives)
`{ name, company, title, location, phone, email, website (honeypot), source }`
The function maps `company→pe_company`, `location→city_country`, `email→work_email`.

## Environment variables (set in Vercel → Project → Settings → Environment Variables)
| Key | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | app's Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role key | **server-side only — never in client/committed code** |
| `RESEND_API_KEY` | Resend API key | optional; if absent, leads still store, just no email |

## Setup steps (deploy chat)
1. **Supabase**: run `deploy/supabase_contact_leads.sql` → creates `contact_leads` with RLS on.
2. **Resend**: create account → **verify domain `stack360.ai`** → add the DKIM/SPF DNS records it gives you.
   Use a sending identity like `notifications@stack360.ai` (matches `from:` in the function).
3. **Vercel**: add the three env vars above (Production + Preview). Redeploy.
4. **Test**: submit the form → confirm a row in `contact_leads` AND an email at `info@stack360.ai`.
   Then submit with the hidden `website` field filled (via devtools) → confirm it's silently dropped.

## Deliverability (don't skip)
- Receiving `info@stack360.ai`: your email host's **MX** records (e.g. Google Workspace).
- Sending: **SPF + DKIM** (from Resend) + a **DMARC** TXT record (`v=DMARC1; p=none; rua=mailto:info@stack360.ai`).
- Without domain verification the email silently fails — this is the #1 launch gotcha.

## Spam / abuse hardening (optional, recommended before heavy traffic)
- Honeypot is already in place. Add **Cloudflare Turnstile** or **hCaptcha** if bots get through.
- Consider a simple per-IP rate limit (Vercel Edge Config / Upstash) if needed.
