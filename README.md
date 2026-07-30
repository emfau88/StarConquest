# StarConquest rebuild

StarConquest is a touch-first browser strategy game about connecting star
systems, sending fleets through energy corridors and timing decisive fleet
surges.

## Playable campaign slice

The rebuild currently contains eight playable sectors with a steady learning
curve:

- **First Contact** introduces connecting and neutral expansion;
- **Pressure Line** adds two expanding enemy outposts;
- **Cut the Current** makes boost cuts the central tactic;
- **Twin Fronts** asks the player to prioritize two attack lanes;
- **Heavy Orbit** combines Pulsars, Giants, Quasars and a fortified Nexus;
- **Helion Run** introduces the long-range orange Helion faction;
- **Three Powers** creates a shifting conflict between three factions;
- **Nexus Siege** closes the campaign with two fortified enemy networks.

The current slice includes:

- production, link growth, energy transfer, capture, win and defeat across all
  eight levels;
- mouse and touch gestures: drag to connect, swipe across a corridor to surge
  its forward fleet and recall its rear formation;
- reciprocal hostile fleets meet at a visible shared front whose outcome
  depends on the energy available at both source systems;
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
- automated simulation tests, a repeatable three-profile balance run and
  GitHub Pages deployment.

The legacy source remains frozen in `reference/legacy-build/`. Its protected
gameplay contract is documented in `docs/core-mechanics.md`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run balance:sim
npm.cmd run build
```

Every push to `main` tests and publishes the production build through GitHub
Pages.
