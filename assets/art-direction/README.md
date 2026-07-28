# StarConquest art-direction styleframes

These images are visual targets for the presentation redesign. They are concept
references, not runtime screenshots or finished game sprites.

## Comparison

### 01 — Bright Orbital

- Strongest tactical readability and blue-versus-red conflict.
- Excellent station hierarchy and central boost moment.
- Too mechanically detailed and symmetrical for the final lightweight Canvas
  implementation.

### 02 — Friendly Relay

- Warmest atmosphere and most inviting energy network.
- Strong class variety and broad portal appeal.
- Drifts too far toward dimensional key art and contains more visual detail
  than the game should reproduce.

### 03 — Star Relay Command

- Recommended production target.
- Flat, readable and achievable with Canvas 2D.
- Combines technical silhouettes with warmer cores and clear directional beads.
- The golden cut, compressed beam front and impact ring communicate the unique
  mechanic without explanatory text.

## Production lock

Use styleframe 03 as the structural reference, with these selective imports:

- Station scale and strong conflict framing from styleframe 01.
- Softer core lighting and asymmetrical network flow from styleframe 02.
- Flat geometry, negative space, beam language and effect restraint from
  styleframe 03.

Runtime systems must remain code-native so ownership, energy, damage, capture
and animation states can be recolored and animated dynamically.

After the brighter polished-casual direction was selected, small code-native
transport ships were added to active routes. The original "no spaceships"
constraint only applied to the styleframe generation: large decorative ships
must not compete with the network, while small gameplay transports are now a
core part of the flow language.

## Shared generation brief

- Format: wide 16:9 gameplay styleframe.
- Direction: Bright Orbital Command plus Friendly Star Relay.
- Palette: navy `#08111F`, player `#39B8FF`, enemy `#FF5A78`, neutral
  `#B8C5D9`, energy `#9BF7FF`, boost `#FFD95A`.
- Required: distinct Pulsar, Giant, Quasar and Nexus silhouettes; readable
  directional beams; one gold boost-cut moment; mobile readability.
- Excluded: text, logos, numbers, characters, realistic planets, spaceships,
  biological cells, tentacles, excessive bloom and cinematic 3D clutter.

Generated with the built-in ImageGen workflow.
