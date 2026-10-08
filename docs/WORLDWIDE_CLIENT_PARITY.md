# Worldwide product discovery: platform parity

The feature is available in all four product surfaces:

| Client | Entry | Interaction | Backing data |
| --- | --- | --- | --- |
| iPhone PWA | Worldwide directory beneath featured channels | Touch, search field, country/category filters, load more | Country shard fetched on demand |
| iOS native | Explore worldwide on home | SwiftUI touch, searchable country picker and channel details | JSON resources included from canonical data folder |
| Android mobile | Explore worldwide on home | Touch, country picker, search, filter chips and lazy scroll | Android shared client-data module |
| Android TV | Explore worldwide in hero actions | D-pad, focus, Android TV text input, country/category rails, lazy scroll | Android shared client-data module |

This is channel **metadata discovery**, not a streaming entitlement or verified playback feature.
All clients filter out adult-labelled and closed records and must not infer that unclassified entries are free.

### What still needs product work

- Accurately mapped, licensable broadcaster art.
- Full EPG programme-grid ingestion, not just metadata mapping IDs.
- Account-synced favourites / profiles / watch history.
- Reliable local caching with stale-state/error recovery across all surfaces.
- Real-world hardware HDMI-CEC testing and iPhone install testing.

### Build verification

- Node catalogue, parity and worldwide discovery tests;
- PWA JavaScript parser check;
- Android mobile + Android TV debug build;
- XcodeGen-generated iOS simulator build (new macOS CI).

Native builds are not to be called successful until those separate CI jobs pass.
