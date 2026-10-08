# Platform architecture

The product targets three first-class client surfaces:

| Surface | Primary input | UI technology | Playback |
| --- | --- | --- | --- |
| iPhone / iPad | touch, gestures, keyboard/accessibility | SwiftUI | AVPlayer / AVKit |
| Android phone / tablet | touch, gestures, keyboard/accessibility | Jetpack Compose Material 3 | Media3 / ExoPlayer |
| Android TV / Fire TV / HDMI stick | D-pad, OK, Back, media keys, HDMI-CEC passthrough | Compose for TV | Media3 / ExoPlayer |

Apple TV/tvOS is a natural later target using the iOS SwiftUI/AVKit work as the starting point.

## Shared product layer

The source of truth is shared even where UI code is native:

- country/channel/feed catalogue;
- provider/package metadata;
- source authorization and playback-mode decisions;
- EPG identities;
- search semantics;
- profile/favourite/history model;
- entitlement rules;
- analytics event names.

Android clients share the `client-data` module today. The iOS build consumes the same canonical JSON as bundled resources; the eventual backend/API replaces bundled catalogues without changing the public models.

## Why the UIs are separate

A phone and a television are not the same interaction environment. A premium product should not stretch one layout across both.

Mobile prioritises thumb reach, gestures, portrait/landscape adaptation, bottom-level navigation and Picture in Picture.

TV prioritises 10-foot readability, directional focus, channel zapping, large hit areas, predictable Back behaviour and remote/CEC input.

Visual identity, content hierarchy and feature semantics remain consistent across surfaces.
