# Runtime transport ships

StarConquest currently has one transport function and therefore only one
visual ship per active faction:

- `transport-player.png`: blue, friendly triangular courier;
- `transport-enemy.png`: red, sharper angular courier.

The ships are rendered along energy routes. Direction, spacing, speed,
quantity, exhaust and boost effects remain code-native. The previous vector
ship remains available as a loading fallback.

Both assets were generated with the built-in ImageGen workflow on flat
chroma-key backgrounds and converted locally to alpha PNGs with soft matte and
despill. Source images and reproducible prompts are stored under
`assets/source/ships/`.
