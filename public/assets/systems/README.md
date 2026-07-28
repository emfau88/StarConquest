# Runtime system assets

The system body artwork is generated, while ownership rings, energy values,
tier pips, focus, capture state and visual effects remain code-native.

This keeps the game state readable and animated without requiring a raster
asset for every possible state.

## Control batch

- `system-player-medium.png`: blue player relay, triangular three-fin profile.
- `system-enemy-medium.png`: red enemy citadel, angular command profile.
- `system-neutral-medium.png`: neutral civilian relay, calm circular profile.

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

This is the medium reference tier. Small and large tier variants should only
be generated after this batch has passed in-game readability review.

The exact reproducible prompt set is stored in
`assets/source/systems/PROMPTS.md`.
