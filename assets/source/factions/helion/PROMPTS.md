# Helion Compact prompts

Generated with the built-in OpenAI ImageGen workflow on 29 July 2026. The
existing red medium system and transport were supplied as visual style
references only.

## Three-tier system family

```text
Use case: stylized-concept
Asset type: horizontal three-cell sprite sheet of faction star systems for a polished casual 2D sci-fi strategy game
Input image: visual style reference only; match the existing chunky beveled mobile-game rendering, crisp dark navy outline, white-metal highlights, readable centered silhouettes, and subtle dimensional lighting. Do not copy its red faction geometry.
Primary request: design the distinct third faction, the solar-gold/orange 'Helion Compact'. Create exactly three separate front/top-down star-system assets in one horizontal 3-column sheet, each centered in its equal cell: LEFT a small PULSAR outpost with a compact triangular sun-prism silhouette and one bright amber core; CENTER a medium GIANT station with three broad radial solar fins around an orange-white core; RIGHT a large NEXUS citadel with a bold six-ray sun-crown silhouette, heavier armor, and a large orange-white reactor. Use warm orange, gold, ivory ceramic armor and dark navy structure. The three sizes must clearly escalate in silhouette complexity while remaining one coherent faction family.
Composition: equal apparent framing per cell but small/medium/large complexity and mass are unmistakable; generous empty padding; no overlap; no dividers; nothing cropped; perfectly front-facing/top-down, no perspective tilt.
Scene/backdrop: perfectly flat uniform solid #00ff18 chroma-key green from edge to edge.
Constraints: no text, no letters, no numbers, no logos, no UI frame, no stars, no space background, no drop shadow or reflection on the backdrop; no green anywhere in the subjects; opaque crisp edges suitable for background removal; readable after reduction to 80-160 game pixels.
```

## Energy transport

```text
Use case: stylized-concept
Asset type: single transparent-ready top-down transport ship sprite for a polished casual 2D sci-fi strategy game
Input image: visual style and functional silhouette reference only; match its crisp beveled mobile-game rendering, readable top-down orientation, opaque edges and compact proportions. Do not copy its black/red faction geometry.
Primary request: design the third faction 'Helion Compact' energy transport. A small fast courier pointing exactly to the RIGHT, with a broad triangular solar-prism nose, two short swept sun-fin wings, one compact rear engine cluster, warm orange energy windows, gold and ivory ceramic armor, and a dark navy structural spine. It should feel nimble and optimistic, clearly different from the existing aggressive red ship, while belonging to the same visual universe. No weapons.
Composition: one ship only, centered, horizontal, full side-to-side silhouette, generous empty padding, no cropped elements, perfectly top-down with no perspective tilt. Keep the silhouette chunky and legible around 26 game pixels.
Scene/backdrop: perfectly flat uniform solid #00ff18 chroma-key green from edge to edge.
Constraints: no text, no letters, no numbers, no logos, no UI frame, no stars, no space background, no exhaust trail, no drop shadow or reflection on the backdrop; no green anywhere in the subject; crisp opaque shapes suitable for background removal.
```

The chroma-key sources were converted locally to alpha PNGs with a soft matte
and green despill. `assets/source/process_ui_assets.py` creates the three
512-pixel system textures and the 768 × 512 transport texture.
