# StarConquest core mechanics contract

## Product promise

StarConquest is a short, web-first strategy puzzle. The player connects owned
star systems, moves energy through those links, captures opposing systems, and
cuts a link at the right moment to send the energy already inside it forward.

The rebuild may change presentation, code structure, wording, menus, audio, and
effects. It must not accidentally change the rules in this document.

## Protected gameplay loop

1. Owned systems generate energy over time.
2. The player drags from an owned system to another system to create a link.
3. Creating a link immediately costs energy based on distance.
4. An active link continuously pumps energy from its source toward its target.
5. Friendly targets are reinforced; hostile or neutral targets lose energy.
6. A target at zero energy changes ownership.
7. Cutting an owned link sends the energy in front of the cut immediately to
   the target and returns the energy behind the cut to the source.
8. The level ends when all hostile systems are captured or all player systems
   are lost.

## System classes

| Class | Capacity | Production per second | Maximum outgoing links | Legacy size |
|---|---:|---:|---:|---:|
| Pulsar | 65 | 2.85 | 1 | 1.0 |
| Giant | 110 | 1.80 | 2 | 1.3 |
| Quasar | 175 | 1.13 | 3 | 1.6 |
| Nexus | 255 | 0.66 | 4 | 2.0 |

Neutral systems do not produce energy. Player, red enemy, and orange enemy
systems use the same class rules.

## Link formation

- Distance cost: `ceil(distance in pixels × 0.04) + 2`.
- Tutorial level exception: the formation cost is always `2`.
- A source may form a link only when `source energy > formation cost + 1`.
- The formation cost is removed from the source and becomes the link's initial
  in-transit energy.
- The legacy link-growth speed is 62 pixels per second. Growth is primarily a
  timing and presentation rule; transfer begins after growth completes.
- There is no hard range limit. The legacy 200-pixel drag circle is not a rule.

## Active energy flow

The legacy base flow rate is `6.5` energy per second.

```text
pressure = clamp(source energy / source capacity, 0, 1)
flow per second = 6.5 × (0.38 + pressure × 0.95)
```

During each active simulation step:

1. Up to `flow × delta time` leaves the link and is applied to the target.
2. Up to the same amount is pumped from the source back into the link.
3. The source can never pump more energy than it currently owns.

This produces a continuous tube-like flow while a healthy source is able to
keep the link charged.

## Reinforcement, attack, and capture

- Same owner: transferred energy is added up to the target capacity.
- Different owner: transferred energy is subtracted from the target.
- At `target energy <= 0`, ownership changes to the link owner.
- Legacy post-capture energy is
  `min(target capacity, max(5, absolute overkill))`.
- Opposing links aimed at a newly captured target are removed by the legacy
  implementation.

The minimum five-energy capture foothold is preserved for the first rebuild
version so that the existing level balance remains comparable. It may be
rebalanced later using playtest data.

## Cut and surge contract

For a cut at normalized link position `t`, where `0` is the source and `1` is
the target:

```text
energy sent forward = in-transit energy × (1 - t)
energy returned = in-transit energy × t
```

- Forward energy is applied to the target immediately.
- Returned energy goes back to the source, capped by source capacity.
- If the source is no longer owned by the link owner, the returned portion is
  lost.
- The cut consumes the link and leaves zero energy in transit.
- A cut with `t < 0.38` and more than three energy sent forward is the legacy
  threshold for the prominent golden boost feedback.

The mechanical split applies to every valid cut. "Boost" describes the
high-value near-source use of that rule, not a separate damage multiplier.

## Level baseline

`powerLimit` is listed because it exists in the legacy level data, but it is
not enforced by the simulation and is not part of the protected rules.

| # | Legacy name | Systems | Factions | 3 stars | 2 stars | AI action interval | AI cut chance |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Erstkontakt | 4 | 2 | 90 s | 150 s | 12.0 s | 0% |
| 2 | Vorposten | 6 | 2 | 110 s | 190 s | 9.0 s | 0% |
| 3 | Gegenoffensive | 7 | 2 | 130 s | 220 s | 7.0 s | 10% |
| 4 | Dominoeffekt | 8 | 2 | 140 s | 240 s | 6.5 s | 12% |
| 5 | Zweifrontenkrieg | 7 | 2 | 160 s | 270 s | 6.0 s | 15% |
| 6 | Dreieckskrieg | 9 | 3 | 180 s | 300 s | 5.5 s | 20% |
| 7 | Belagerungsring | 9 | 3 | 210 s | 360 s | 5.0 s | 25% |
| 8 | Endschlacht | 10 | 3 | 240 s | 400 s | 4.2 s | 32% |

Exact legacy layouts, starting energy, AI timing, messages, and stories remain
available in `reference/legacy-build/index.html`. They will be moved into typed
level data during the rebuild rather than copied as embedded JavaScript.

## Explicitly excluded from the rebuild contract

These are legacy implementation or UI problems, not gameplay requirements:

- The HUD value labelled "ENERGIE", which only displays the unused
  `powerLimit`.
- The current control bar, which counts owned systems rather than real power.
- The 25/50/100 buttons, which misleadingly change the global flow rate for
  every link.
- The fixed 200-pixel range circle.
- German-only strings, externally loaded Google Fonts, and unguarded
  `localStorage`.
- The current menu chain and the monolithic single-file architecture.
- Visual class names drawn inside every system.

## Items to validate during the vertical slice

These legacy behaviors are initially preserved or isolated, but are not yet
declared final balance decisions:

- Whether a captured system should always start with at least five energy.
- Whether replacing the oldest outgoing link should discard its in-transit
  energy.
- Whether players need a genuine per-link transfer mode at all.
- Exact AI action and cut timings after the onboarding and visual pacing change.
- Final star thresholds after effects and level flow become faster to read.

## Step 1 acceptance checks

The executable reference tests must prove:

- owned systems produce and neutral systems do not;
- production cannot exceed capacity;
- formation cost follows distance and tutorial rules;
- active hostile flow removes energy from the target;
- crossing zero captures the target;
- a cut divides in-transit energy into forward and returned portions;
- a near-source cut sends most energy forward and can capture immediately.
