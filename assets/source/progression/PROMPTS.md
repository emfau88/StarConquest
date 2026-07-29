# Campaign progression icon prompt

Generated with the built-in OpenAI ImageGen workflow on 29 July 2026. The
existing HUD icon sheet was supplied as a visual style reference only.

> Use case: stylized-concept
> Asset type: three-cell campaign progression icon sprite sheet for a polished casual sci-fi strategy game
> Input image: visual style reference only; match the same chunky beveled mobile-game icon language, crisp navy outline, white metal, cyan highlights, and compact readable silhouette
> Primary request: create exactly three separate icons in one horizontal 3-column sheet. Left cell: a sturdy closed padlock with a small cyan key light, clearly meaning locked. Center cell: a clean completed-sector badge with a bold white check mark inside a cyan circular seal. Right cell: one premium five-point campaign star in warm gold with a pale center highlight and subtle navy outline.
> Composition: one icon centered in each equal third, equal visual scale, generous padding, no overlap, no dividers, no cropped elements
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background, completely uniform edge to edge
> Constraints: no text, no letters, no numbers, no extra symbols, no UI panels, no grid, no shadows or reflections on the background; do not use magenta in the subjects; crisp opaque shapes suitable for background removal and display at 20–48 pixels

The selected sheet uses a strict chroma key rather than a soft color-distance
matte so its white lock body, check mark, and star highlights remain intact.
`assets/source/process_ui_assets.py` creates the three 128-pixel runtime PNGs.
