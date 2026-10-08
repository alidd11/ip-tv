# ip-tv

Premium multi-platform live-TV product foundation for **iOS, Android mobile, Android TV / Fire TV and branded HDMI-stick hardware**.

## Product direction

This is one product with device-native interaction:

- **iPhone / iPad:** touch-first SwiftUI + AVKit.
- **Android phone / tablet:** touch-first Jetpack Compose + Media3.
- **Android TV / Fire TV / HDMI stick:** remote-first Compose for TV + Media3.
- **TV remote support:** D-pad/media keys plus HDMI-CEC passthrough where the television and final stick hardware support it.

The visual identity and catalogue are shared; the UI is intentionally adapted instead of stretching a phone layout onto a television.

## Current foundation

- 249-country catalogue.
- Curated GB/TR/US launch catalogues.
- Premium UK packages including Sky Sports, Sky Cinema and TNT Sports.
- Channel/feed/provider/package separation.
- Provenance-gated playback-source registry.
- Source audit/quarantine for unknown public-playlist candidates.
- Shared Android catalogue/data module.
- Android touch client scaffold.
- Android TV/Fire TV remote client scaffold.
- Native SwiftUI iOS client scaffold.
- Catalogue and Android build CI.

## Repository structure

```text
client-data/          # shared Android catalogue/data layer
mobile-android/       # touch-first Android client
tv-app/               # Android TV / Fire TV / HDMI-stick client
ios-app/              # SwiftUI / AVKit iPhone/iPad client
config/               # verified playback/source policy data
data/                 # canonical catalogue
docs/                 # product, design and input architecture
schemas/
scripts/
src/                   # catalogue tooling
test/
```

## Catalogue model

```text
Country -> Channel -> Feed -> EPG mapping / Playback source
```

A channel never contains a live stream URL. Delivery endpoints are separate so a source can change without breaking favourites, search, history or guide identity.

## Validation

```bash
npm run check
```

The catalogue CI validates data consistency. A separate Android workflow compiles both the mobile and TV clients.

## Input model

Mobile is fully touch-enabled. TV is fully operable with D-pad/OK/Back/media/channel keys. See `docs/INPUT_MODEL.md` and `docs/REMOTE_CONTROL.md`.

## Design direction

The product is deliberately positioned as a premium living-room/mobile service: cinematic editorial hierarchy, fast navigation, strong focus/touch feedback, proper EPG, premium channel/package presentation and native playback surfaces.

See `docs/DESIGN_SYSTEM.md` and `docs/PLATFORM_ARCHITECTURE.md`.
