# Product parity contract

The product is maintained as **one service across four client surfaces**:

- PWA
- iOS native
- Android mobile
- Android TV / Fire TV / branded HDMI stick

"1:1 parity" means the same user capability, catalogue semantics, account state and entitlement logic exist on every supported client. Interaction patterns may adapt to the device: touch on mobile/PWA, remote focus on TV.

## Current parity matrix

| Capability | PWA | iOS | Android | TV | Contract |
| --- | --- | --- | --- | --- | --- |
| Country catalogue | ✅ | ✅ | ✅ | ✅ | Same canonical JSON |
| Channel catalogue | ✅ | ✅ | ✅ | ✅ | Same stable IDs |
| Free/premium labels | ✅ | ✅ | ✅ | ✅ | Same access model |
| Official source/provider decision | ✅ | ✅ | ✅ | ✅ | Same source registry |
| Live channel browsing | ✅ | ✅ scaffold | ✅ scaffold | ✅ scaffold | Same ordering and categories |
| Native HLS playback | Browser HLS where supported | AVPlayer scaffold | Media3 dependency | Media3 dependency | Same approved source |
| Provider handoff | ✅ | ✅ | ✅ | ✅ | Same provider URL |
| Search | ⏳ | ⏳ | ⏳ | ⏳ | Must ship together |
| EPG / guide | ⏳ | ⏳ | ⏳ | ⏳ | Same programme IDs/data |
| Favourites | ⏳ | ⏳ | ⏳ | ⏳ | Account-synced |
| Continue watching | ⏳ | ⏳ | ⏳ | ⏳ | Account-synced |
| Profiles | ⏳ | ⏳ | ⏳ | ⏳ | Same profile model |
| Parental controls | ⏳ | ⏳ | ⏳ | ⏳ | Same policy |
| Picture in Picture | browser/device support | ⏳ | ⏳ | N/A | Platform-appropriate |
| D-pad / TV remote | keyboard-compatible | N/A | keyboard/gamepad-compatible | ✅ | TV-specific interaction |
| Touch | ✅ | ✅ | ✅ | N/A | Mobile/PWA-specific interaction |

Legend: ✅ implemented/scaffolded at the current foundation level; ⏳ planned and must be delivered cross-client.

## Release rule

A feature that changes the product model must not be marked complete until:

1. its data/API contract is shared;
2. PWA behaviour exists;
3. iOS behaviour exists;
4. Android-mobile behaviour exists;
5. TV behaviour exists where the feature applies;
6. platform-specific accessibility/input behaviour is tested.

If a capability genuinely does not apply to a surface, the matrix must say why instead of silently omitting it.
