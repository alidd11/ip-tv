# Worldwide channel discovery

Source: https://github.com/iptv-org/database (Unlicense).
Full metadata API: https://github.com/iptv-org/api.

This database is for **identities**, not playback: it imports channels, regional feeds,
official-looking logos as **unapproved artwork candidates**, and EPG identifiers.
It deliberately never reads the upstream streams endpoint.

Run `npm run catalog:worldwide:sync` to import all discoverable channel records.
Run `npm run catalog:worldwide:verify` to validate the resulting shards and totals.

The generated snapshot is in `data/worldwide/manifest.json` and individual
country/territory files in `data/worldwide/countries/<code>.json`.
Upstream UK maps to ISO GB. Unknown and unmatched regions are preserved under ZZ.

All recorded channels are included, including defunct and adult-labelled records
for archival/completeness, but the regular client must show only channels with
`isClosed === false && isAdult === false`. Profiles/age-gating must be added
before any optional adult channel browser is introduced.

A channel's accessModel is 'unclassified'. It is not automatically "free" just
because someone listed its name or submitted a video link. The existing curated
catalogue and verified source registry have precedence for playback.

Global country shards should be lazily loaded by PWA/iOS/Android/TV. The snapshot
format is the cross-platform contract; no UI is considered parity-complete until
it actually renders and searches the worldwide catalogue on all four surfaces.

The feature-branch workflow downloads and validates the full snapshot on GitHub
Actions, then commits generated data to the same branch. Later scheduled runs
only publish reviewable artifacts.
