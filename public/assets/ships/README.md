# Runtime transport ships

StarConquest currently has one transport function and therefore only one
visual ship per active faction:

- `transport-player.webp`: blue, friendly triangular courier;
- `transport-enemy.webp`: red, sharper angular courier;
- `transport-enemy2.webp`: gold/orange Helion solar-prism courier.

The ships are rendered along energy routes. Direction, spacing, speed,
quantity, exhaust and boost effects remain code-native. The previous vector
ship remains available as a loading fallback.

The assets were generated with the built-in ImageGen workflow on flat
chroma-key backgrounds and converted locally to transparent sources with soft
matte and despill. The 256-pixel runtime WebPs are still over twice their
maximum physical display size. Sources and reproducible prompts are stored
under `assets/source/ships/`, `assets/source/factions/helion/`, and
`assets/source/runtime-originals/`.
