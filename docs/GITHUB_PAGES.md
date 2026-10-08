# iPhone PWA preview hosting

The repository includes a GitHub Pages Actions workflow that builds only
the verified static PWA bundle and deploys it from `main`.

No paid hosting plan or external access token is required for subsequent
deployment *after* the repository owner enables GitHub Pages once.

## Initial activation (if the first deployment is blocked)

1. Open GitHub repository **Settings → Pages**.
2. Set **Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Publish iPhone PWA preview → Run workflow**.
4. Wait until both upload and deployment pass. Use the exact URL reported
   by the workflow (do not assume a site has been published in advance).

On iPhone, open the resulting HTTPS link in Safari and use
**Share → Add to Home Screen → Open as Web App**.

## Security

The deployable bundle contains only PWA files, curated public channel
metadata, verified delivery handoffs and worldwide channel metadata. It does
not publish the repository scripts, source audits or native source code.

Premium channel catalogue entries remain metadata-only unless there is
an authorised provider handoff. GitHub Pages deployment does not make any
subscription channels freely playable.

## Updating

Merging a PWA or catalogue change into `main` automatically runs the
deployment workflow, with one active deployment at a time. Verify the
reported page URL and CI statuses after each merge.
