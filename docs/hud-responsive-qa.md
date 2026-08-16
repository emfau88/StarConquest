# Responsive HUD QA

Last verified: 16 August 2026

The production build was tested in the browser at the portal target sizes
listed below, in both English and German.

| Viewport | Objective | Panel overlap | Touch targets | Accessible names |
| --- | --- | --- | --- | --- |
| 800 × 450 | Fully visible | None | 48 CSS px | Complete |
| 821 × 462 | Fully visible | None | 48 CSS px | Complete |
| 907 × 510 | Fully visible | None | 48 CSS px | Complete |
| 1080 × 607 | Fully visible | None | 48 CSS px | Complete |

The compact layout keeps the sector, mission objective, timer, overflow menu
and pause action visible. Language, campaign map, restart, audio and fullscreen
remain available through the overflow menu. The menu closes after an action or
with Escape and restores focus to its trigger.

The regular desktop layout was also rechecked at 1216 × 684 without clipping
or panel overlap.
