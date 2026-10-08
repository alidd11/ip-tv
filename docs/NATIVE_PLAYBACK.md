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
