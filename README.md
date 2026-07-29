# StarConquest rebuild

StarConquest is a touch-first browser strategy game about connecting star
systems, routing energy and cutting links at the right moment.

## Playable campaign slice

The rebuild currently contains six playable sectors with a steady learning
curve:

- **First Contact** introduces connecting and neutral expansion;
- **Pressure Line** adds two expanding enemy outposts;
- **Cut the Current** makes boost cuts the central tactic;
- **Twin Fronts** asks the player to prioritize two attack lanes;
- **Heavy Orbit** combines Pulsars, Giants, Quasars and a fortified Nexus;
- **Helion Run** introduces the long-range orange Helion faction.

The current slice includes:

- production, link growth, energy transfer, capture, win and defeat across all
  six levels;
- mouse and touch gestures: drag to connect, swipe across a link to cut;
- responsive 16:9 canvas, mobile safe areas and a landscape orientation hint;
- fullscreen toggle with a mobile orientation-lock attempt;
- dynamic mission HUD, visual connect/cut tutorial cues, pause, restart,
  next-sector flow, lightweight sound effects and result screen;
- compact campaign map with persistent sector unlocks and best star ratings;
- three difficulty-themed sector backgrounds, generated HUD icons and a
  faction-colored capture burst;
- faction-specific transport and star-system artwork, including distinct
  Quasar and Nexus silhouettes plus the playable orange Helion faction,
  with Canvas fallbacks;
- automated simulation tests and GitHub Pages deployment.

The legacy source remains frozen in `reference/legacy-build/`. Its protected
gameplay contract is documented in `docs/core-mechanics.md`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Every push to `main` tests and publishes the production build through GitHub
Pages.
