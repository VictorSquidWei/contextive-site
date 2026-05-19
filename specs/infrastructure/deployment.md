# Deployment

How this site gets to the public — Vercel (primary) + Netlify (alternative, configured but not active).

## File(s)

- [vercel.json](../../vercel.json) — Vercel platform config
- [netlify.toml](../../netlify.toml) — Netlify platform config
- [api/subscribe.ts](../../api/subscribe.ts) — Vercel serverless function (see [api.md](api.md))

## Vercel (primary)

Vercel auto-detects Vite by inspecting `package.json` — no `framework` field is set in `vercel.json` because the defaults work. The platform infers:

- Install: `npm install`
- Build: `npm run build` (`tsc -b && vite build`)
- Output: `dist/`
- Functions dir: `api/`

### `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### Rewrites

The `/api/:path*` rewrite is a no-op (source equals destination). It's there to make routing intent explicit and to prevent SPA fallback from intercepting `/api/*` paths.

#### Headers

Applied to every response (including assets).

| Header | Value | Reason |
|---|---|---|
| `X-Frame-Options` | `DENY` | Disallow embedding in iframes (clickjacking protection) |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Send origin only on cross-origin |

### Deploy flow

1. Push to `main` on https://github.com/VictorSquidWei/contextive-site.
2. Vercel detects the push, runs `npm install` + `npm run build`.
3. On success, the new deployment becomes the production URL.
4. Preview deployments are created automatically for non-`main` branches and PRs.

Vercel's default URL: `https://contextive-site-<hash>.vercel.app`. Custom domains (`contextive.ai`) are configured in the Vercel project settings.

### Environment variables

None required. The `/api/subscribe` endpoint is open-credential (see [api.md](api.md)).

## Netlify (alternative, not active)

The `netlify.toml` is kept so the site is portable. Switching to Netlify requires:

1. Move `api/subscribe.ts` → `netlify/functions/subscribe.ts` and adapt the handler signature (Netlify uses `{ statusCode, body, headers }` returns instead of `(req, res)`).
2. Update Hero / FinalCTA fetch URL from `/api/subscribe` to `/.netlify/functions/subscribe`.
3. Point DNS at the Netlify deploy.

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

The `/*` → `/index.html` redirect is SPA-fallback (Netlify doesn't infer it from Vite the way Vercel does).

The same three security headers are mirrored from `vercel.json`.

## Domain

Currently deploying to a Vercel-provided URL. The Open Graph / OG tags in [index.html](../../index.html) reference `https://contextive.ai` as the canonical URL.

## Boundary

You may change in this spec:
- Security header values.
- Adding a new platform header (mirror across `vercel.json` and `netlify.toml` if both are kept).
- Adding redirects.
- Adding `framework: 'vite'` to `vercel.json` if auto-detection ever fails.

You must update *other specs* before changing:
- Switching active platform from Vercel to Netlify — touches [api.md](api.md) (handler signature + URL).
- Adding env vars — touches both [api.md](api.md) and Vercel project settings.
- Removing the `X-Frame-Options: DENY` header (security regression — flag explicitly).

## Out of scope

- The serverless function logic — [api.md](api.md).
- The build commands and outputs — [build.md](build.md).
