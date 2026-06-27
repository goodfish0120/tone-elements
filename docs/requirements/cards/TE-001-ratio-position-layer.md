# TE-001: Ratio Position Layer

Status: `prototype`

Kind: `Object Layer`

## Idea

Generate discrete frequency nodes from an anchor frequency, rational ratio, octave shift, and cents offset.

## Why It Matters

This is the current mathematical microscope for building resonance positions instead of choosing vague descriptive presets.

## Objects Affected

Partial or resonance nodes.

## Controls

- anchor Hz
- numerator / denominator
- octave range
- cents offset
- gain
- attack / hold / release
- phase

## Graph View

Frequency map exists, but it is not yet a proper `frequency -> dB` graph.

## Audition Behavior

Full stack playback exists. Solo exists at layer level, but selected-stack graph rendering is not complete.

## Implementation Slice

Existing `src/ratio-position/*`.

## Verification

- Candidate frequencies should match `anchorHz * (numerator / denominator) * 2^octave * 2^(offsetCents / 1200)`.
- Adding a candidate should create a right-side layer.

## Open Questions

- Should ratio layers become one layer with many generated child nodes, instead of one layer per selected node?
- How should law layers target these nodes?
