# Runtime system assets

The system body artwork is generated, while ownership rings, energy values,
tier pips, focus, capture state and visual effects remain code-native.

This keeps the game state readable and animated without requiring a raster
asset for every possible state.

## Complete three-size family

- Player: `system-player-small.webp`, `system-player-medium.webp`,
  `system-player-large.webp`.
- Enemy: `system-enemy-small.webp`, `system-enemy-medium.webp`,
  `system-enemy-large.webp`.
- Neutral: `system-neutral-small.webp`, `system-neutral-medium.webp`,
  `system-neutral-large.webp`.
- Helion Compact: `system-enemy2-small.webp`, `system-enemy2-medium.webp`,
  `system-enemy2-large.webp`.
- Class-specific Quasars: `system-player-quasar.webp` and
  `system-enemy-quasar.webp`.

Runtime class mapping:

- `PULSAR`: small;
- `GIANT`: medium;
- `QUASAR`: class-specific four-fin turbine for player and enemy;
- `NEXUS`: existing heavy large-tier command station;
- neutral Quasars fall back to the neutral large tier until one is used by a
  campaign level.
- Helion Quasars currently use the large solar-citadel silhouette. The faction
  enters the playable campaign in sector 6, `Helion Run`.

The three source generations used the built-in ImageGen workflow. Each asset
was generated front-on on a flat chroma-key background, then converted locally
to a transparent source PNG with soft matte and despill. Runtime WebP files are
limited to 640 pixels because the renderer never displays them above 536
physical pixels at its supported DPR cap. Sources are kept under
`assets/source/systems/` and `assets/source/runtime-originals/`.

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
