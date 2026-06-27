# TE-005: Gain Law Layer

Status: `shaped`

Kind: `Law Layer`

## Idea

A transform layer that adjusts gain according to a rule, like `gainDb = baseDb + slope * log2(frequency / anchor)`.

## Why It Matters

Many sound structures are controlled by physical or psychoacoustic rules rather than by hand-tuning every node.

## Objects Affected

Partial nodes, event-cloud events, possibly noise-band center frequencies.

## Controls

- target layer or group
- base dB
- dB per octave slope
- curve amount
- frequency pivot / anchor
- random deviation amount

## Graph View

Shows the law curve and resulting node dB values in `frequency -> dB`.

## Audition Behavior

Can audition target layers with and without the law enabled.

## Implementation Slice

- Add layer type `gain-law`.
- Add target selection by id, group, or all audible layers.
- Apply law before rendering.
- Draw law in frequency graph.

## Verification

- Positive slope makes higher nodes louder.
- Negative slope makes higher nodes softer.
- Disabling the law restores original gains.

## Open Questions

- Should laws destructively rewrite generated nodes, or remain non-destructive modifiers?
