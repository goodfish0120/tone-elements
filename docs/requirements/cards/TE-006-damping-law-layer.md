# TE-006: Damping Law Layer

Status: `idea`

Kind: `Law Layer`

## Idea

A rule that makes higher frequencies decay faster or slower than lower frequencies.

## Why It Matters

This is a common physical/material constraint and should not require manually editing every partial's release.

## Objects Affected

Partials, noise bands, event-cloud events.

## Controls

- target layer or group
- high-frequency decay scale
- low-frequency decay scale
- pivot frequency
- curve shape

## Graph View

Appears in both `frequency -> dB` and `time -> dB`, because it changes decay by frequency.

## Audition Behavior

Compare original target stack against damped target stack.

## Implementation Slice

- Compute per-object release multiplier from log-frequency.
- Apply to envelope sampling and renderer.

## Verification

- Higher nodes visibly end sooner in the time graph when high-frequency damping is strong.

## Open Questions

- Should damping also reduce initial gain, or only affect decay?
