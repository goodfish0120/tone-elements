# TE-009: Noise Band Layer

Status: `idea`

Kind: `Object Layer`

## Idea

A continuous noise region with center frequency, width, color, pressure, and filter shape.

## Why It Matters

Friction, breath, air, dirt, surface contact, and organic corruption need continuous regions, not only discrete partials.

## Objects Affected

Noise bands and filter regions.

## Controls

- center frequency
- bandwidth
- color
- filter type
- pressure
- roughness
- gain
- envelope

## Graph View

Shows band region in `frequency -> dB`; envelope in `time -> dB`.

## Audition Behavior

Can audition noise band alone, with anchor, or with law layers.

## Implementation Slice

- Add `noise-band` layer type.
- Render filtered noise with envelope.
- Draw band as a region, not a point.

## Verification

- Width changes graph region and audible texture.
- Pressure changes gain or density without hard clipping.

## Open Questions

- Should pressure be a direct gain control or a driver that affects bandwidth and roughness too?
