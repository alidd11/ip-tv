# PWA client

Touch-first installable test surface for iPhone/iPad and any modern browser.

The PWA reads the **same canonical catalogue and verified source registry** as the native clients. It is intentionally not a separate product.

## Local test

From the repository root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/web-pwa/
```

For iPhone testing, serve the repository over HTTPS, open `/web-pwa/` in Safari, use Share → Add to Home Screen, and keep **Open as Web App** enabled.

## Parity

See `docs/PARITY_MATRIX.md`. New product features must be delivered across PWA, iOS, Android and TV where applicable.
