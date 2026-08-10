# stack360-web — Stack360 public site

Static marketing site for **stack360.ai** + a contact-form serverless function.
Host on **Vercel** (static + `/api`), lead store in **Supabase**, notification email via **Resend**.

## Structure
- `index.html` — the landing page (self-contained except linked `/fonts` + `/assets`).
- `assets/` — screenshots (webp).  `fonts/` — Inter + Fraunces (woff2, self-hosted).
- `favicon.*`, `icon-*.png`, `apple-touch-icon.png`, `og-cover.png`, `site.webmanifest` — icons + social card.
- `robots.txt`, `sitemap.xml`, `llms.txt` — SEO + GEO (AI answer engines).
- `api/contact.js` — POST endpoint for the form (stores in Supabase, emails info@stack360.ai).
- `vercel.json` — clean URLs, security headers, long-cache for assets/fonts.
- `deploy/` — Supabase table SQL + the contact-form setup spec. **Not part of the served site.**

## Quick deploy
1. Push this folder to a GitHub repo.
2. Vercel → New Project → import repo → framework preset **Other** → Deploy.
3. Run `deploy/supabase_contact_leads.sql` in Supabase.
4. Set env vars in Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.
5. Add domain `stack360.ai` in Vercel; set DNS. Verify `stack360.ai` in Resend (SPF/DKIM) + add DMARC.
6. Google Search Console → submit `sitemap.xml`.

See `deploy/Stack360_ContactForm_Spec.md` and the project's `Stack360_Publish_Runbook.md` for the full play.
