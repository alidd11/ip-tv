# Native Android TV/mobile playback

## Implemented
- Android phone and Android TV both use the same `client-data` Media3
  `LivePlayerActivity`; no divergent playback implementation.
- `ChannelPlayback.open` routes only approved HTTPS native HLS feeds into
  in-app ExoPlayer, with Media3 PlayerView playback controls.
- Official website and subscription-provider links remain external handoffs.
  A provider page is **not** treated as a direct TV feed.
- Stream source is re-resolved by stable channel ID inside the unexported
  activity. Arbitrary URL extras are not accepted.
- Player pauses/releases resources when stopped; reloads source on resume.
- TV remote: D-pad/OK/Back retain normal focus/back semantics. Play, pause,
  rewind and fast-forward media keys are handled where seeking is supported.
- Report connection/playback errors without silently falling back to
  unverified streams.

## Still to test
- Real network stream health, device codecs, geography restrictions and DRM
  remain conditional on channel/provider rights and the viewer's region.
- HDMI-CEC TV-to-stick remote passthrough requires actual hardware checks.
- Channel Up/Down zapping, EPG programme grid, profile entitlements and PiP
  are not implemented by this change.
- iOS AVPlayer and browser HLS are separate platform-specific surfaces that
  follow the same vetted source model.

Use `gradle :mobile-android:assembleDebug :tv-app:assembleDebug` to compile.
The release claim here is **build integration**, not real-device video QA.

## In-app channel switching

The same **authorised HLS-only** channel queue now applies to every client:

- **Android mobile:** Media3 full-screen player has touch-operable Previous/Next buttons.
- **Android TV/Fire TV:** the same player also responds to Channel Up / Channel Down
  keys; Play/Pause/seek controls remain remote-operable.
- **iOS native:** AVPlayer / SwiftUI player offers touch Previous/Next buttons
  while staying on the same viewing screen.
- **iPhone PWA:** iOS Safari plays HLS in the embedded video surface. The player
  includes touch buttons and keyboard navigation, with no raw stream URL in
  page query parameters.

Only channels with an enabled, HTTPS, directly approved HLS source and
`requiresAuth === false` are included. The queue is ordered by the curated
country/channel list and wraps at its ends. It never silently switches into
a subscription-provider login, another website or an unauthorised URL.

**Source inventory at implementation time:** four direct HLS source records
(one US / three Turkish). Other indexed channels are **not** suddenly playable
because player controls exist. Streams may still be geo-restricted, unavailable,
DRM-protected or temporarily offline. This work has build/browser validations,
not physical TV/iPhone end-to-end channel-play verification.

### Follow-up milestones

- Improve on-screen remote focus and overlay auto-hide with hardware input tests.
- Add in-app channel guide with actual licensed EPG programme data.
- Add authorised subscription entitlements / DRM SDK integrations per provider.
- Physical HDMI-CEC and codec/network testing on target TV sticks.
- iOS native PiP, media sessions and background playback policy review.
- Enable GitHub Pages for the PWA preview (currently repository-setting blocked).
