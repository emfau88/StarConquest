# HUD icon source

Generated with the built-in ImageGen workflow on a removable magenta
background. `hud-icons-transparent.png` is the locally keyed intermediate,
and `assets/source/process_ui_assets.py` extracts the eight 128×128 runtime
icons.

## `hud-icons-chroma.png`

```text
Use case: ui-mockup
Asset type: raster HUD icon sheet for a polished casual sci-fi mobile strategy game
Primary request: Create exactly eight separate action icons arranged in a precise 4-column by 2-row grid, one centered icon per equal cell. Row 1 left to right: circular restart arrow, speaker with two sound waves, speaker with a small X for muted audio, four outward fullscreen corners. Row 2 left to right: four inward fullscreen-exit corners, pause with two vertical bars, right-pointing play triangle, simple stopwatch. No labels and no extra icons.
Style/medium: premium polished-casual game UI icons, chunky readable silhouettes, lightly beveled painted raster art, consistent line weight and scale, designed to remain clear at 24 pixels
Composition/framing: landscape sheet, exact uniform 4x2 layout, generous and identical padding inside every cell, no dividers, each symbol isolated and fully visible
Color palette: bright white and pale ice blue faces, restrained navy-blue inner shading, tiny cyan highlights; do not use magenta in any icon
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal
Constraints: all eight icons must share one coherent style, crisp opaque edges, minimal controlled glow only, no text, no numbers, no button containers, no circles behind icons except the restart arrow itself, no watermark, no cast shadows, no floor or environmental background
Avoid: thin hairline symbols, photorealism, elaborate frames, gradients or texture in the chroma background, duplicated or missing icons
```
