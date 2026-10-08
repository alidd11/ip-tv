# Product research notes

This project uses other media players as feature and architecture references. No third-party application code has been copied into the repository.

## Strong references

### TiviMate

Useful product ideas: multiple playlists, favourites, universal search, multiview, catch-up, recording, parental controls and layout personalisation. It is a player-only product, which is also a clean separation for our client.

### IPTVnator

Useful ideas: M3U/M3U8, XMLTV EPG, Xtream/Stalker provider adapters, automatic playlist refresh, global favourites, archive/catch-up, custom request headers and multi-language UI. Source code is MIT-licensed, but we are currently using it only as a behavioural reference.

### Jellyfin Android TV

Useful reference for Android TV / Fire TV navigation patterns, release discipline and big-screen ergonomics. The app is GPL-2.0, so copying its implementation into a closed commercial client would create licensing obligations.

### Hypnotix

Useful separation between the player and content providers, with M3U URL, local M3U and provider support. It is GPLv3.

### iptv-org database/API

Useful data-model reference: channels, feeds, logos, guides and streams are independent entities. Its database is published under The Unlicense. Our metadata importer stages channel/feed/logo metadata only and intentionally skips stream ingestion.

### Free-TV

Useful curation principle: quality over quantity, prefer official/free channels, record geo restrictions and continuously health-check sources. We should adopt that operational philosophy rather than blindly ingesting a huge playlist.

## Product principles derived from the review

1. **Remote-first, not touch-first.** The device lives ten feet away.
2. **Fast channel zapping.** Keep the guide/cache warm and minimise player recreation.
3. **One global catalogue, many providers.** Users should not care which playlist/provider supplied a channel.
4. **Stable IDs.** Favourites and history key off our IDs, not volatile stream URLs.
5. **Quality over quantity.** A smaller catalogue of reliable channels beats thousands of dead entries.
6. **EPG is a first-class feature.** Guide data should be independently refreshable and cacheable.
7. **Multiple sources per feed.** Health scoring/failover can be added later without changing the channel model.
8. **On-device resilience.** Cached catalogue/EPG should survive temporary backend or provider outages.
9. **Profiles and parental controls.** Model these before UI so they do not become a bolted-on feature.
10. **Do not couple the commercial product to GPL code unless we deliberately accept the licence obligations.**

## Source audit findings — 2026-10-08

The current public-repository scan reinforced that playlist inclusion is not sufficient provenance. `iptv-org/iptv` contains a mix of first-party broadcaster endpoints, official public webcasts, regional/geo-blocked sources and third-party feeds whose authorization cannot be established from the playlist alone.

Promoted examples are deliberately narrow: Bloomberg Television has a first-party Bloomberg HLS endpoint and official live page; TRT 1, TRT Haber and TRT Çocuk expose first-party TRT media endpoints; Sky News publishes an official live page and verified live YouTube broadcast. Turkish broadcasters including Kanal D, Star TV, NOW, TV8 and ATV also publish official live-watch pages, so those are represented as official web handoffs unless/until their underlying media CDN endpoint is independently tied back to the broadcaster.

Premium UK catalogue entries are now modelled separately from delivery. Sky Sports and Sky Cinema are subscription products on Sky; TNT Sports is subscription content whose UK streaming home moved to HBO Max in March 2026. Their catalogue entries therefore use official provider handoffs rather than copied third-party media URLs.

The Free-TV repository remains a useful discovery source because its stated policy explicitly excludes channels that are normally available only through private commercial subscriptions and requires evidence that additions are free. It is still treated as a discovery input rather than a trust root.
