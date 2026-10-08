# ip-tv

Foundation for a remote-first TV/streaming product intended for Android TV / Fire TV-class hardware.

## Current phase: countries and channels

The repository is deliberately **data-first**. We are establishing stable country, channel and feed identities before adding the player UI or backend.

### Included now

- 249-country catalogue
- launch catalogues for United Kingdom, Turkey and United States
- channel categories
- separate channel/feed models
- playback-source schema kept outside channel metadata
- deterministic channel index generation
- catalogue validation
- metadata-only iptv-org import staging script
- architecture and competitive research notes

## Structure

```text
config/
  playback-sources.example.json
data/
  countries.json
  categories.json
  channels/
    GB.json
    TR.json
    US.json
    index.json
  feeds/
    GB.json
    TR.json
    US.json
  imports/                 # generated metadata staging, gitignored
docs/
  ARCHITECTURE.md
  RESEARCH.md
schemas/
  country.schema.json
  channel.schema.json
  feed.schema.json
  playback-source.schema.json
scripts/
  build-index.mjs
  import-iptv-org.mjs
  validate-catalog.mjs
```

## Data model

```text
Country -> Channel -> Feed -> EPG mapping / Playback source
```

A channel never contains a live stream URL. Delivery endpoints are deliberately separate so they can change without breaking favourites, search, history or EPG mappings.

## Commands

```bash
npm run check
npm run catalog -- countries
npm run catalog -- channels --country=GB
npm run catalog -- search BBC --country=GB
```

`npm run check` builds the deterministic channel index, validates catalogue relationships and runs the catalogue tests.

To stage public **metadata only** from iptv-org:

```bash
npm run import:metadata -- --countries=GB,TR,US
```

Imported files go under `data/imports/iptv-org/` for review and are not treated as canonical automatically. The importer does not fetch the iptv-org streams endpoint.

## Next

1. Expand and verify the launch channel catalogues.
2. Add approved logos and EPG identifiers.
3. Add source/provider health modelling and failover.
4. Build the Android TV shell with D-pad-first country/channel browsing.
5. Add guide, favourites, recently watched and search.

## Source verification

The catalogue now distinguishes channel access from playback provenance. Premium channels such as Sky Sports, TNT Sports and Sky Cinema are catalogued for search, guide and package UX, but they use official subscription-provider handoffs unless a broadcaster-authorized public media endpoint is independently verified.

Approved sources live in `config/playback-sources.verified.json`. Candidate findings from public playlist repositories are reviewed in `data/source-audit.json`; rejected and unknown candidates never retain their stream URL. See `docs/SOURCE_POLICY.md`.

Current seeded state: 249 countries, 71 channels, 71 feeds, 3 UK providers, 4 UK packages, and a provenance-gated source registry.
