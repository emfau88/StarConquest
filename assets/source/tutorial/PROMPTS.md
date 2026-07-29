# Tutorial gesture prompt

Generated with the built-in OpenAI ImageGen workflow on 29 July 2026. The
existing HUD icon sheet was supplied as a visual style reference only.

> Use case: stylized-concept
> Asset type: two-cell tutorial gesture sprite sheet for a polished casual sci-fi strategy game
> Input image: visual style reference only; match its chunky white-and-cyan beveled icon language, dark navy outline, soft blue highlights, and clean readable silhouette
> Primary request: create exactly two separate tutorial gesture icons in one horizontal 2-column sheet. Left cell: a simple white/cyan fingertip or hand cursor dragging a small glowing blue orb toward a pale circular target, with one short directional motion trail. Right cell: a simple white/cyan fingertip or hand cursor making a fast diagonal swipe across a thin blue energy route, with a small clean break spark at the crossing.
> Composition: each icon centered within its own half, equal scale, generous padding, no overlap between halves, no dividers, no cropped elements
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background, completely uniform edge to edge
> Constraints: no text, no letters, no numbers, no logo, no UI frame, no grid, no planet artwork, no additional icons; do not use magenta anywhere in the icon subjects; no cast shadow or reflection onto the background; crisp opaque shapes suitable for background removal and display at 64–96 pixels

The chroma-key source is converted to an alpha PNG with the ImageGen skill's
`remove_chroma_key.py` helper. `assets/source/process_ui_assets.py` then splits
and scales the two runtime PNGs.
