# Premium TV design system

## Intent

The client should feel like a premium television platform rather than a repackaged Android utility.

Reference quality bar: Apple TV, Sky Stream and premium first-party streaming apps. These are visual/interaction references only; the UI remains original.

## Visual language

- near-black canvas rather than flat pure black;
- restrained violet/cyan spectral accents;
- large editorial type and generous negative space;
- 18–24dp corner radii on cards and controls;
- focus expressed with scale, elevation and a clean white edge;
- artwork-first hero treatment;
- badges limited to meaningful states: LIVE, PREMIUM, 4K, NEW;
- no phone bottom navigation;
- no hamburger menu;
- no generic Android settings/list appearance.

## 10-foot typography

- hero title: 48–64sp;
- section headings: 24–32sp;
- card titles: 20–26sp;
- metadata: 13–16sp;
- never rely on tiny labels for critical information.

## Motion

Focus motion should be fast and quiet:

- focus scale: ~1.05–1.08;
- focus animation: 110–170ms;
- background/hero transitions: 250–400ms;
- no long decorative animations that delay input.

## Layout

The home surface uses:

1. slim persistent navigation rail;
2. full-bleed editorial hero;
3. country/source chips;
4. horizontal live channel rails;
5. premium sports/movie rails;
6. continue-watching rail when history exists.

The guide is a dedicated full-screen surface rather than a popover.


## Mobile editorial refinement (2026-10-08)

Actual screenshot review exposed a 510px blank hero and overly tall dead space
on phones. The PWA mobile hero is now around 416 CSS pixels with a decorative,
data-driven network-name art panel. It deliberately uses **no broadcast network
logo or programme image**, since source database logo candidates aren't
licence-cleared visual assets.

- editorial focal point is the selected approved viewing destination;
- source-aware CTA remains above the fold on a typical iPhone viewport;
- 12–18px clear copy, condensed 20–27px section hierarchy;
- textured matte channel cards with premium/subscription labels;
- small, touch-friendly segmented country chips and four-tab navigation.

Native surfaces retain the same content hierarchy/source/action model.
Further visual work should review the captured Chromium screenshots first and
port any *meaningful* hierarchy change to native views rather than letting
features or accessibility drift.
