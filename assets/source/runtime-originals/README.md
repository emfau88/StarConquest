# Transparent runtime source masters

These PNG files are the full-resolution, transparent masters produced from the
original chroma-key ImageGen output. They live outside `public/` so Vite does
not copy multi-megabyte source art into the production build.

Run `python assets/source/process_ui_assets.py` to regenerate the smaller WebP
system and transport assets used by the game.
