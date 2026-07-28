# Runtime system assets

The system body artwork is generated, while ownership rings, energy values,
tier pips, focus, capture state and visual effects remain code-native.

This keeps the game state readable and animated without requiring a raster
asset for every possible state.

## Complete three-size family

- Player: `system-player-small.png`, `system-player-medium.png`,
  `system-player-large.png`.
- Enemy: `system-enemy-small.png`, `system-enemy-medium.png`,
  `system-enemy-large.png`.
- Neutral: `system-neutral-small.png`, `system-neutral-medium.png`,
  `system-neutral-large.png`.

Runtime class mapping:

- `PULSAR`: small;
- `GIANT`: medium;
- `QUASAR`: large;
- `NEXUS`: large, rendered at the larger Nexus gameplay radius.

The three source generations used the built-in ImageGen workflow. Each asset
was generated front-on on a flat chroma-key background, then converted locally
to an alpha PNG with soft matte and despill. Chroma-key source images are kept
under `assets/source/systems/`.

All three prompts specify:

- polished-casual 3D mobile-strategy rendering;
- front-facing orthographic composition;
- a crisp silhouette readable at gameplay size;
- restrained core bloom;
- no text, UI, routes, ships, outer ownership rings or shadows.

The medium control batch established faction identity. The small variants use
fewer rings and modules, while the large variants use broader silhouettes and
additional outer structures. Runtime scaling remains controlled by the system
class radius.

The exact reproducible prompt set is stored in
`assets/source/systems/PROMPTS.md`.
