# TE-010: Surface Contact Layer

Status: `idea`

Kind: `Object Layer`

## Idea

Model friction-like behavior from pressure, speed, roughness, stickiness, and changing contact.

## Why It Matters

Cloth, towel, leather, scraping, rubbing, and many object interactions are surface-contact sounds.

## Objects Affected

Noise bands, event clouds, motion fields.

## Controls

- pressure
- speed
- roughness
- stickiness
- contact area
- slip/stick amount
- material damping

## Graph View

Shows pressure and density over time, plus noise-band change over frequency.

## Audition Behavior

Can isolate contact sound from tonal layers.

## Implementation Slice

- Start as a preset combination of noise-band plus event-cloud plus laws.
- Later promote to its own specialized layer.

## Verification

- More pressure increases intensity.
- More speed shifts energy upward.
- More stickiness creates interrupted or elastic motion.

## Open Questions

- Should surface contact be a high-level macro or a primitive layer?
