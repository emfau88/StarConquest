# System control-batch prompts

Generated with the built-in ImageGen workflow on 28 July 2026.

## Player medium

```text
Use case: stylized-concept
Asset type: square game sprite for a polished casual mobile space strategy game
Primary request: create one medium-tier BLUE player star system / orbital relay hub, designed as the master visual reference for a family of game assets
Subject: centered perfectly front-facing circular orbital station with a luminous cyan-blue energy core, compact layered navy and silver mechanical armor ring, three subtle evenly spaced directional fins, a few small cyan emissive accents; strong readable silhouette at 96 px; premium friendly sci-fi, capable and optimistic rather than militaristic
Style/medium: polished casual 3D game asset, crisp hand-crafted shapes, clean beveled materials, slightly stylized proportions, high-end mobile strategy game quality, consistent with a bright cobalt and cyan space battlefield
Composition/framing: exactly one object, orthographic/front-on, centered, fully visible, generous equal padding on all sides, square canvas, no perspective tilt, no crop
Lighting/mood: soft upper-left studio key light plus controlled cyan core emission, bright and inviting, restrained bloom contained close to the object
Color palette: deep navy metal, cool silver, cobalt blue, bright cyan and pale aqua; do not use magenta anywhere in the subject
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for removal; one uniform color, no gradient, no texture, no stars, no floor, no shadow, no reflection
Constraints: opaque solid station body with clean crisp outer edges; core may glow but keep the glow tight; no ownership ring outside the station, because animated ownership and status rings will be rendered in code
Avoid: text, letters, numbers, logos, UI, routes, beams, spaceships, planets, asteroids, particles, lens flare, watermark, realistic NASA aesthetic, dark horror mood, excessive tiny detail, cast shadow, contact shadow
```

## Enemy medium

```text
Use case: stylized-concept
Asset type: square game sprite for a polished casual mobile space strategy game
Input images: Image 1 is the BLUE player system and is a strict reference for rendering style, camera angle, polish, material quality, lighting direction, scale and padding; do not copy its silhouette or blue faction design
Primary request: create one medium-tier RED enemy star system / command citadel that clearly belongs to the same asset family as Image 1
Subject: centered perfectly front-facing circular hostile orbital station with a luminous coral-red energy core; darker gunmetal and warm silver segmented armor; strong angular hexagonal outer silhouette; two short swept blade-like side structures and three compact red power cells; assertive and dangerous but still friendly polished-casual, never horror
Style/medium: match Image 1 exactly in polished casual 3D rendering, crisp hand-crafted shapes, clean bevels, stylized proportions and high-end mobile strategy quality
Composition/framing: exactly one object, orthographic/front-on, centered, fully visible, same visual scale and equal generous padding as Image 1, square canvas, no perspective tilt, no crop
Lighting/mood: match Image 1 soft upper-left studio key light plus controlled red core emission; restrained bloom contained close to the object
Color palette: charcoal navy, dark gunmetal, warm silver, coral red, orange-red and pale peach highlights; do not use green anywhere in the subject
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for removal; one uniform color, no gradient, no texture, no stars, no floor, no shadow, no reflection
Constraints: opaque solid station body with clean crisp outer edges; core may glow but keep glow tight; no ownership/status ring outside the station because it will be animated in code; preserve the same production style as Image 1 while making the faction silhouette unmistakably different
Avoid: text, letters, numbers, logos, UI, routes, beams, spaceships, planets, asteroids, particles, lens flare, watermark, skulls, spikes, demonic motifs, realistic NASA aesthetic, dark horror mood, excessive tiny detail, cast shadow, contact shadow
```

## Neutral medium

```text
Use case: stylized-concept
Asset type: square game sprite for a polished casual mobile space strategy game
Input images: Images 1 and 2 are strict references for the shared rendering style, camera angle, polish, material quality, lighting direction, scale and padding; create a third member of the same family without copying either faction silhouette
Primary request: create one medium-tier NEUTRAL unclaimed star system / civilian relay hub
Subject: centered perfectly front-facing compact circular orbital station with a soft pearl-white energy core; practical silver and cool gray layered armor; calm rounded silhouette with four small evenly spaced rectangular docking lugs and a simple segmented inner ring; technologically valuable but clearly inactive and unclaimed; friendly, readable and less aggressive than either reference
Style/medium: match both references exactly in polished casual 3D rendering, crisp hand-crafted shapes, clean bevels, stylized proportions and high-end mobile strategy quality
Composition/framing: exactly one object, orthographic/front-on, centered, fully visible, same visual scale and equal generous padding as the reference assets, square canvas, no perspective tilt, no crop
Lighting/mood: match the soft upper-left studio key light; controlled pearly-white core emission with a subtle cool-blue edge, restrained bloom contained close to the object
Color palette: graphite gray, cool silver, pale steel blue, pearl white and tiny amber maintenance accents; do not use magenta anywhere in the subject
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for removal; one uniform color, no gradient, no texture, no stars, no floor, no shadow, no reflection
Constraints: opaque solid station body with clean crisp outer edges; core may glow but keep glow tight; no ownership/status ring outside the station because ownership will be animated in code; visually quieter and more circular than both faction systems, while retaining exactly the same production family
Avoid: text, letters, numbers, logos, UI, routes, beams, spaceships, planets, asteroids, particles, lens flare, watermark, weapons, wings, spikes, realistic NASA aesthetic, dark horror mood, excessive tiny detail, cast shadow, contact shadow
```

## Small and large production variants

The six variants were generated with the matching medium faction image as a
strict reference for faction identity, rendering style, orthographic camera,
materials, upper-left lighting, normalized object scale and equal padding.

Shared prompt:

```text
Use case: stylized-concept
Asset type: square game sprite for a polished casual mobile space strategy game
Style/medium: match the approved medium reference exactly in polished casual
3D rendering, clean bevels, crisp hand-crafted shapes and premium mobile
strategy quality.
Composition/framing: exactly one object, orthographic/front-on, centered,
fully visible, same normalized object scale and generous equal padding as the
reference, square canvas, no tilt and no crop.
Constraints: opaque station body with crisp outer edges; restrained core bloom
contained close to the object; no external ownership/status ring because game
state is drawn in code.
Avoid: text, numbers, logos, UI, routes, beams, ships, planets, asteroids,
particles, lens flare, watermark, cast shadow and contact shadow.
```

### Player small

```text
Primary request: small-tier blue player star system, a compact scout relay.
Subject: luminous cyan-blue core; simplified navy and cool-silver armor; one
main ring; three short triangular fins; three cyan status lights; visibly
lighter and less developed than medium; readable at 64 px.
Backdrop: uniform #ff00ff chroma key. Do not use magenta in the subject.
```

### Player large

```text
Primary request: large-tier blue player star system, an advanced nexus command
relay.
Subject: powerful cyan-blue core; layered navy and bright-silver armor; two
concentric mechanical rings; six clearly separated stabilizer modules; broader
authoritative silhouette and additional energy conduits; friendly rather than
weapon-like; readable at 128 px.
Backdrop: uniform #ff00ff chroma key. Do not use magenta in the subject.
```

### Enemy small

```text
Primary request: small-tier red enemy star system, a compact forward outpost.
Subject: coral-red core; simplified charcoal and warm-silver armor; one angular
hexagonal ring; two short swept side blades and one top power cell; assertive
but not sinister; readable at 64 px.
Backdrop: uniform #00ff00 chroma key. Do not use green in the subject.
```

### Enemy large

```text
Primary request: large-tier red enemy star system, a formidable command
citadel.
Subject: powerful coral-red core; layered charcoal gunmetal and warm-silver
armor; reinforced hexagonal body; six broad angular bastion modules; restrained
red conduits; more advanced than medium but readable rather than cluttered.
Backdrop: uniform #00ff00 chroma key. Do not use green in the subject.
```

### Neutral small

```text
Primary request: small-tier neutral unclaimed star system, a compact civilian
navigation beacon.
Subject: pearl-white core; simplified cool-gray and silver armor; one segmented
ring; three docking tabs with tiny amber maintenance lights; visibly basic,
inactive and readable at 64 px.
Backdrop: uniform #ff00ff chroma key. Do not use magenta in the subject.
```

### Neutral large

```text
Primary request: large-tier neutral unclaimed star system, a major civilian
exchange and relay nexus.
Subject: bright pearl-white core; layered graphite, pale steel-blue and silver
armor; two concentric segmented rings; eight peaceful docking modules; amber
maintenance lights and cool-white conduits; advanced but non-military.
Backdrop: uniform #ff00ff chroma key. Do not use magenta in the subject.
```

## Class-specific Quasar pair

Generated with the built-in OpenAI ImageGen workflow on 29 July 2026. The
approved blue and red large-system sources were supplied as visual references
only. Existing large assets remain the heavy Nexus silhouettes.

```text
Use case: stylized-concept
Asset type: two-cell top-down Quasar system sprite sheet for a polished casual sci-fi strategy game
Input images: Image 1 and Image 2 are visual style, material, faction-color, and rendering references only. Do not copy their heavy six-sided Nexus silhouettes.
Primary request: create exactly two matching Quasar-class orbital stations in one horizontal 2-column sheet. Left cell is the player version in cobalt blue, white metal, and bright cyan energy. Right cell is the enemy version in charcoal gunmetal, warm ivory armor, and bright coral-red energy. Both must share exactly the same distinctive Quasar silhouette: a fast-looking circular turbine with four long swept radial fins, a bright open energy core, slim concentric rings, and clear rotational motion language. The silhouette must look lighter, sharper, and more energetic than the heavy hexagonal Nexus references.
Style: top-down orthographic polished casual 2D/3D game sprite, crisp layered armor, restrained highlights, readable at 120 pixels
Composition: each complete station centered in its own half at equal scale, generous padding, no overlap, no divider, no cropped parts
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background, completely uniform edge to edge
Constraints: no text, no letters, no numbers, no ships, no UI, no shadows or reflections on the background; do not use magenta in either station; exactly two station sprites and no additional objects
```

The selected source is chroma-keyed with a tighter 96-point opaque threshold
to preserve both luminous energy cores before being split into the two runtime
PNGs.
