# StarConquest rebuild

StarConquest is a touch-first browser strategy game about connecting star
systems, routing energy and cutting links at the right moment.

## Playable vertical slice

Step 3 implements the first complete level, **First Contact**:

- production, link growth, energy transfer, capture, win and defeat;
- mouse and touch gestures: drag to connect, swipe across a link to cut;
- responsive 16:9 canvas, mobile safe areas and a landscape orientation hint;
- fullscreen toggle with a mobile orientation-lock attempt;
- tutorial prompts, pause, restart, lightweight sound effects and result screen;
- automated simulation tests and GitHub Pages deployment.

The legacy source remains frozen in `reference/legacy-build/`. Its protected
gameplay contract is documented in `docs/core-mechanics.md`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Every push to `main` tests and publishes the production build through GitHub
Pages.
