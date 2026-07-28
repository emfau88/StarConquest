# Capture VFX source

Generated with the built-in ImageGen workflow. The final runtime texture uses
additive/screen blending, so it deliberately has a pure black background.

## `capture-burst-additive.png`

```text
Use case: stylized-concept
Asset type: compact additive 2D game capture-VFX texture for a polished casual sci-fi strategy game
Primary request: Create one single centered circular conquest/capture energy burst, viewed perfectly head-on. A white-hot compact core, one strong segmented energy ring, a second thinner shock ring, and 10 to 12 crisp outward energy shards/sparks. The effect should feel celebratory and decisive, not destructive.
Style/medium: premium polished-casual mobile game VFX, clean painted raster art, readable when displayed around 180 pixels wide
Composition/framing: square canvas, one effect only, centered, radially symmetric, occupies about 70 percent of the canvas, generous empty padding, no cropping
Color palette: pure white, pale ice blue and bright cyan only; absolutely no magenta, pink, purple, red, green, or yellow
Scene/backdrop: perfectly flat pure black #000000 background intended for additive/screen blending; background must be uniform black with no texture or gradient
Constraints: bright clean energy shapes against black, controlled glow, no smoke, no planet, no star system, no ship, no UI frame, no text, no watermark, no cast shadow, no floor, no environmental background
Avoid: explosion fire, debris, realistic lens flare, dense particles, colored nebula, background stars, magenta or purple tint
```

`assets/source/process_ui_assets.py` resizes the generated source to the
512×512 runtime texture.
