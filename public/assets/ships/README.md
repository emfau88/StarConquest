# Runtime fleet ships

Each active faction has three visual silhouettes:

- `transport-player.webp`: blue, friendly triangular courier;
- `transport-enemy.webp`: red, sharper angular courier;
- `transport-enemy2.webp`: gold/orange Helion solar-prism courier.
- `interceptor-*.webp`: slim, fast-looking route and battle-front craft;
- `cruiser-*.webp`: broader line ships used at high visual throughput.

The variants are deliberately presentational rather than mechanical classes.
Direction, spacing, speed, quantity, exhaust, impacts and battle-front effects
remain code-native. The previous vector ship remains available as a loading
fallback.

The assets were generated with the built-in ImageGen workflow on flat
chroma-key backgrounds and converted locally to transparent sources with soft
matte and despill. The 256-pixel runtime WebPs are still over twice their
maximum physical display size. Sources and reproducible prompts are stored
under `assets/source/ships/`, `assets/source/factions/helion/`, and
`assets/source/runtime-originals/`.
