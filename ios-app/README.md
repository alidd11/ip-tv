# iOS client

The iPhone client is a native SwiftUI/AVKit surface. It intentionally does not reuse the Android TV presentation layer.

The source files in this folder establish the touch-first home, channel rails and playback/provider handoff behaviour. The Xcode project and resource-copy phase are the next iOS packaging step.

Required resource layout inside the iOS bundle:

```text
catalogue/
  countries.json
  playback-sources.verified.json
  channels/
    GB.json
    TR.json
    US.json
```

The canonical JSON remains in the repository root under `data/` and `config/`; build tooling should copy it into the iOS bundle rather than maintaining a second catalogue.
