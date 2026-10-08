# Worldwide discovery API

The worldwide catalogue is country-sharded; clients should request only their
active country's shard. Never eagerly load 31,522 full channel records at startup.

CLI:

- `npm run worldwide -- countries`
- `npm run worldwide -- list --country=GB --category=sports --limit=25`
- `npm run worldwide -- search --country=TR --query=TRT`

The JavaScript service at `src/worldwide-catalog.mjs` provides
`listWorldwideCountries`, `getWorldwideCountry`,
`searchWorldwideCountry`, and `filterWorldwide`.

Default results exclude adult-labelled and defunct records. IDs are the exact
iptv-org upstream IDs. `accessModel` remains `unclassified`, which means
the directory is informational unless a curated source mapping exists.
