# Input model

## Mobile

Touch is first-class on iOS and Android:

- tap to select/play;
- horizontal swipe/scroll for channel rails;
- vertical scrolling for discovery;
- long-press for contextual actions where appropriate;
- system Back gesture/button on Android;
- standard iOS navigation gestures;
- accessible labels and dynamic text behaviour;
- keyboard/switch-control support where supplied by the OS.

Remote/D-pad input on mobile must not be blocked; focusable controls should still work with keyboards, game controllers and accessibility devices.

## TV

TV is remote-first:

- D-pad moves focus;
- OK/Enter selects;
- Back dismisses the most local surface;
- Menu opens contextual actions;
- Play/Pause controls playback;
- Rewind/Fast-forward seek where the stream supports it;
- Channel Up/Down zaps live channels;
- Home is system-owned.

HDMI-CEC TV remotes can drive these same Android key paths when the final stick hardware and television support Remote Control Passthrough.

## Shared rule

Every critical action must have an input-appropriate path on every supported surface. Touch-only gestures may have remote/button equivalents; remote-only shortcuts may have visible touch controls.
