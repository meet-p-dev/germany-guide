# Deploying Germany Guide

Three services, three jobs:

- **Supabase** — the database (already live: project `germany-newcomer-guide`).
- **GitHub** — hosts the source code.
- **Vercel** — builds and serves the website, auto-deploying on every push to GitHub.

The steps below are ordered. Steps marked **(you)** need your own account/login;
the rest can be scripted.

---

## 1. Put the code on GitHub

```bash
git init
git add .
git commit -m "Germany Guide — initial release"
```

Then create a repo and push. Either:

- **With the GitHub CLI** (if `gh auth status` is logged in):
  ```bash
  gh repo create germany-guide --private --source=. --push
  ```
- **(you) Manually:** create an empty repo at <https://github.com/new> (no README),
  then:
  ```bash
  git remote add origin https://github.com/<your-username>/germany-guide.git
  git branch -M main
  git push -u origin main
  ```

`.env.local` is gitignored, so **no secrets are committed** — you re-enter them in
Vercel next.

## 2. Import into Vercel — **(you)**

1. Go to <https://vercel.com/new> and import the `germany-guide` GitHub repo.
2. Framework preset auto-detects **Next.js**. Leave build settings default.
3. Before the first deploy, add **Environment Variables** (Settings → Environment
   Variables). Copy the values from your local `.env.local`:

   | Variable | Value | Needed for |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ilfhjffpzvzphbvhdpup.supabase.co` | always |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` (from `.env.local`) | always |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL (set after step 3) | SEO/sitemap/OG |
   | `SUPABASE_SECRET_KEY` | service-role key | only if using `/admin` in prod |
   | `ADMIN_EMAILS` | your email | only if using `/admin` in prod |
   | `REVALIDATE_SECRET` | a random string | only if using on-demand revalidation |

   The last three are optional — the public site works without them. Never put the
   service-role key in a `NEXT_PUBLIC_*` variable.
4. Deploy. Vercel gives you a URL like `https://germany-guide.vercel.app`.

## 3. Point the site URL at itself, then redeploy — **(you)**

1. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the exact deployed URL from step 2.
2. Redeploy (Deployments → ⋯ → Redeploy) so `sitemap.xml`, canonical tags and the
   OG image use the real domain.

## 4. Make sign-in work in production — **(you)**

Supabase needs to trust the new domain, or email/Google login will fail:

1. Supabase dashboard → **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL.
3. Add `https://<your-vercel-url>/auth/callback` to **Redirect URLs**.

(Login is optional for visitors — it only syncs checklist progress — but do this so
it works.)

## 5. Google Search Console (get indexed) — **(you)**

This is what makes the guides show up in Google search, the whole point of the SEO
work.

1. Go to <https://search.google.com/search-console>, add a property for your URL.
2. Verify ownership. Easiest: the **HTML meta tag** method — paste the tag into
   `app/layout.tsx` `metadata.verification.google` (tell me the code and I'll add
   it), or use the DNS method if you own a custom domain.
3. Under **Sitemaps**, submit: `https://<your-site>/sitemap.xml`.
4. Indexing takes days to weeks; check back in Search Console for coverage.

---

## Updating the site later

Because Vercel is connected to GitHub, shipping an update is just:

```bash
git add . && git commit -m "…" && git push
```

Vercel rebuilds and redeploys automatically. Content-only changes (new guides,
problems) happen in Supabase and appear via ISR within an hour, or instantly if you
publish through `/admin/review` (which triggers revalidation) — no redeploy needed.

## Custom domain (optional, later)

Buy a domain, add it in Vercel (Settings → Domains), update `NEXT_PUBLIC_SITE_URL`
and the Supabase Auth URLs to match, and re-submit the sitemap under the new domain
in Search Console.
