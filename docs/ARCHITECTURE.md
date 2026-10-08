# Architecture direction

## Product target

The first hardware target is an Android TV / Fire TV-class HDMI streaming device controlled primarily with a D-pad remote. The product should remain usable on other Android TV devices so the software is not tied to one OEM stick.

## Core principle: separate identity from delivery

A **channel** is stable product metadata. A **feed** describes a regional or language variant. A **playback source** describes how a feed is delivered. EPG mappings sit alongside feeds rather than being baked into the channel identity.

This means a broken or replaced stream can be changed without changing favourites, watch history, search results, analytics keys or UI references.

```text
Country
  -> Channel
      -> Feed
          -> EPG mapping
          -> Playback source(s)
```

## Planned TV client stack

- Kotlin
- Jetpack Compose for TV
- AndroidX Media3 / ExoPlayer for primary playback
- Room for local catalogue/EPG/cache state
- OkHttp for playlists, EPG and API calls
- Coil for artwork

A secondary compatibility playback engine can be evaluated later if real hardware testing shows codecs/containers Media3 cannot reliably handle.

## Remote-first UX

The TV app should never depend on touch. Every screen needs deterministic D-pad focus, visible focus state, Back behaviour, long-press alternatives, channel up/down zapping and sensible focus restoration after overlays close.

## Catalogue

`data/countries.json` contains all known countries but only countries with curated channel + feed files are enabled. Channel files contain no playback URLs.

## Import pipeline

`scripts/import-iptv-org.mjs` imports **metadata only** from the iptv-org API into an isolated `data/imports/` staging area. It deliberately does not import streams. Curated data can then be reviewed before promotion into the canonical catalogue.
