# Remote-control contract

The TV client is remote-first. Touch is never required.

## Required actions

| User action | Android key input |
| --- | --- |
| Move focus | DPAD_UP / DOWN / LEFT / RIGHT |
| Select | DPAD_CENTER / ENTER / BUTTON_A / BUTTON_SELECT |
| Back / dismiss | BACK / BUTTON_B |
| Context / more | MENU |
| Play / pause | MEDIA_PLAY_PAUSE / MEDIA_PLAY / MEDIA_PAUSE |
| Rewind | MEDIA_REWIND / BUTTON_L1 |
| Fast forward | MEDIA_FAST_FORWARD / BUTTON_R1 |
| Previous channel | CHANNEL_DOWN |
| Next channel | CHANNEL_UP |

The Home key is system-owned and must not be intercepted.

## TV remote / HDMI-CEC

The application accepts normal Android key events, so remote-control passthrough from HDMI-CEC can drive the same focus and playback paths when the final playback-stick hardware and television support it.

CEC itself is a device/OEM responsibility. Hardware selection must therefore include:

- HDMI-CEC support in the SoC / board;
- Android HDMI-CEC HAL integration;
- Remote Control Passthrough;
- One Touch Play;
- power/input switching interoperability testing;
- testing against Samsung Anynet+, LG SIMPLINK, Sony BRAVIA Sync, Panasonic VIERA Link and common generic CEC implementations.

The software must still work perfectly with the bundled Bluetooth/IR remote if a television has CEC disabled or implements it poorly.

## Focus rules

- Exactly one actionable item has focus.
- Focus is visually unmistakable from at least 3 metres.
- Closing an overlay restores focus to the element that opened it.
- No focus traps.
- Back always closes the most local surface before leaving a screen.
- Channel Up/Down changes channels only in the player/live context.
- Media keys are not swallowed outside playback.
