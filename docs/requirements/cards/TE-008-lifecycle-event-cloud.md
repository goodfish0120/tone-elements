# TE-008: Lifecycle Event Cloud

Status: `idea`

Kind: `Object Layer`

## Idea

Generate many small events with random but rule-bound lifecycles, like flame leaves, surface crackle, droplets, sand, cloth, or organic bubbling.

## Why It Matters

Many natural or material sounds are not single tones; they are many tiny births and deaths.

## Objects Affected

Event objects with time, frequency, gain, duration, envelope, motion, and randomness.

## Controls

- density
- lifetime range
- size range
- frequency range
- envelope shape
- pitch motion
- event correlation
- randomness seed

## Graph View

Shows event density in `time -> dB` and event frequency distribution in `frequency -> dB`.

## Audition Behavior

Can audition event cloud alone or mixed with anchor/partials/noise.

## Implementation Slice

- Add `event-cloud` layer type.
- Generate deterministic events from seed.
- Render each event as tone, filtered noise, or both.

## Verification

- Density increases event count.
- Lifetime changes visible event length and audible texture.
- Same seed produces same event pattern.

## Open Questions

- Should fire, cloth, crackle, and bubbles be presets of event cloud or separate specialized layer types?
