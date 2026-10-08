# Device-local saved channels

Feature scope: save/un-save channels from the worldwide metadata directory,
view saved channels even when a different country is selected, persist after
reopening the app on the same device.

The saved key is `iptv.savedChannels.v1` on each client, implemented using:

- PWA: localStorage with blocked-storage handling;
- iOS: UserDefaults Codable records;
- Android phone / Android TV: SharedPreferences in client-data.

All four clients use stable worldwide catalogue IDs. Saving a channel **does
not grant subscription access**, verify playback, or imply the channel is free.
The device store has a maximum of 500 entries. Closed/adult channel records
are excluded from default directory discovery and do not become available
through this feature.

No cross-device sync is provided yet. `library.favourites` remains **planned**
in the machine-readable parity contract until an authenticated profile store
is built and tested across all four clients.

## Validation

- PWA: unit tests cover persistence, tampered records, stable IDs, no stream URL
  storage and cross-country saved records;
- Chromium: exercises saving a Turkish channel, reload persistence and removal;
- Android: mobile and TV compile job;
- iOS: simulator compile job.
