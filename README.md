# vireilo-site

Source of record for the public marketing site at **https://vireilo.com**, deployed via
Netlify.

## What this is

Hand-authored static HTML — not build output. There is no bundler, no framework, and no
build step: what is in this repo is byte-for-byte what Netlify serves. Edit the `.html`
files directly.

## Provenance

Recovered on 2026-08-09 from a Netlify deploy archive
(`deploy-6a7675f0635bc7b6f89e71e1`, deploy timestamp 2026-08-09T02:42Z). Before that
commit **this content had no version control anywhere** — the only copies were Netlify's
CDN and a downloaded zip. That is the reason this repo exists.

If the live site and this repo ever disagree, the live site is not automatically right;
check which was edited last, because a Netlify-side edit would not appear here.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Landing page |
| `contact.html` / `contact-thank-you.html` | Contact form + post-submit page |
| `sms-consent.html` / `sms-thank-you.html` | SMS opt-in consent flow + post-submit page |
| `privacy.html`, `terms.html` | Legal pages |
| `404.html` | Netlify's not-found page (served automatically) |
| `_headers` | Netlify response headers — security headers plus asset caching |
| `robots.txt`, `sitemap.xml` | Crawler directives |
| `assets/` | `logo-nav.png`, `logo-brand.png`, `og.png` (social card) |

## Forms

Contact and SMS consent use **Netlify Forms** (`data-netlify="true"`) with a honeypot
field (`data-netlify-honeypot="bot-field"`). Submissions land in the Netlify dashboard;
there is no server-side code and no API key anywhere in this repo. Verified at import:
zero secret-shaped strings across all HTML.

## Headers

`_headers` sets `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, and
`Permissions-Policy: camera=(), microphone=(), geolocation=()` site-wide, plus a
one-year immutable cache on `/assets/*`. Changing a logo therefore requires a new
filename, not a re-upload — the old one will stay cached for up to a year.

## Relationship to the estate

This site is **public and unauthenticated**. It links to `https://dash.vireilo.com`, the
private estate console, which sits behind Cloudflare Access and then a passphrase gate.
Nothing in this repo carries estate data, credentials, or read paths, and nothing in it
should. Treat any pull request here as public-facing copy, not estate code.
