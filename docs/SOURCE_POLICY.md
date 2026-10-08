# Source verification policy

Playback sources are treated as a separate, security-sensitive layer. A channel appearing in the catalogue does **not** mean a playable stream is approved.

## Active-source rule

Only these source classes may be enabled in `config/playback-sources.verified.json`:

- `verified-official`: a broadcaster/provider-controlled URL or first-party media endpoint.
- `verified-public-authorized`: a public feed whose broadcaster authorization has been independently established.
- `subscription-provider`: an official provider handoff that requires a legitimate subscription/account.

Unknown or rejected candidates are never stored as active URLs. The audit keeps only channel-level findings, provenance and a reason.

## GitHub/public playlist imports

Repositories such as iptv-org and Free-TV are discovery inputs, not a trust root. Each candidate is reclassified independently before activation. Public visibility, a working HLS URL, or inclusion in an M3U file is not enough by itself.

## Premium channels

Premium channels belong in the catalogue so search, EPG, favourites and package UI remain complete. When no public broadcaster-authorized media endpoint exists, their source is an official provider handoff (`subscription-provider`) rather than a copied third-party stream.

## Health checks

Later source health checks should probe only approved endpoints, record latency/codec/resolution, and never automatically promote an `unknown` source to active status.
