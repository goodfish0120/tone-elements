# TE-007: Tail Shape Law

Status: `shaped`

Kind: `Tail Shape`

## Idea

Tail shape is editable morphology, not only a generic release slider.

## Why It Matters

Water-drop, sticky, clean, dry, smeared, granular, broken, and rotten endings produce different meanings even when the same nodes are used.

## Objects Affected

Any audible layer or selected stack.

## Controls

- target layer or group
- shape type
- curvature
- rebound amount
- droplet ring amount
- smear amount
- zero-crossing cleanup

## Graph View

`time -> dB` should show the exact tail curve.

## Audition Behavior

Can audition the same stack with different tail shapes.

## Implementation Slice

- Add reusable tail curve functions.
- Add `tail-shape-law` layer.
- Apply the law to selected layer envelopes.

## Verification

- Water-drop tail has a visible rounded body and curved decay to zero.
- Clean tail reaches zero without a hard click.

## Open Questions

- Should tail shape apply per layer or to a post-mix group envelope?
