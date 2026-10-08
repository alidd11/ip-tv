# Browser/PWA release build

Run `npm run build:web` from the repository root. The output in `dist/`
contains only the PWA shell, country/channel metadata, verified playback registry
and worldwide country shards — not the repository's internal scripts,
documentation, audits or native application sources.

The root URL redirects to `/web-pwa/`. iPhone Safari can install the HTTPS
site using Share → Add to Home Screen → Open as Web App.

For local testing:

```bash
npm run build:web
python3 -m http.server 4173 -d dist
```

Navigate to `http://localhost:4173/web-pwa/`. Device testing requires HTTPS.
