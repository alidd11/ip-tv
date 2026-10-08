# Channel provenance and home hero selection

We found the initial home hero on every client picked Sky Sports Main Event by
hardcoded ID. This offered a premium subscription landing page before any
approved playable channel, and some rails said "Live now" despite having no
actual programme/EPG state.

The home surfaces now select the best option **for the chosen country**:

1. approved native HLS source (when supported);
2. approved official broadcaster page;
3. subscription-provider handoff;
4. catalogue listing with an Explore action, not a dead Watch button.

Only enabled, HTTPS registry sources with accepted provenance/authorization
are eligible. Source selection does **not** perform a real-time stream health
probe and does not guarantee regional playback availability.

Labels distinguish "Watch channel", "Watch on official site", "View
subscription", and "Explore channels"; they no longer imply a live programme
is currently on. Curated channel directory records remain intact.

The iOS app uses AVPlayer for supported HLS; the Android launch client still
hands source URLs to an Android-capable external viewing app. A dedicated
Media3 in-app player remains future work. Do not describe Android HLS as an
in-app player until that is implemented.
