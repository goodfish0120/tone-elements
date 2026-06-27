# TE-004: Time To dB Envelope View

Status: `planned`

Kind: `Analysis View`

## Idea

Show `x = time`; `y = dB`.

## Why It Matters

Attack, decay, release, water-drop tail, sticky tail, broken tail, and event lifecycles are only understandable when seen over time.

## Objects Affected

Envelopes, tail shapes, lifecycle events, selected audition stack.

## Controls

- selected stack source
- show individual layer curves
- show summed envelope estimate
- show event-cloud density over time

## Graph View

Primary view is `time -> dB`.

## Audition Behavior

The graph follows the same layer stack being heard.

## Implementation Slice

- Add envelope sampler functions.
- Draw per-layer and summed dB curves.
- Support tail-shape curves as reusable functions.

## Verification

- Changing attack / hold / release updates the graph.
- Soloing a layer changes the time graph.
- Tail shape choices visibly change curve morphology.

## Open Questions

- Should time graph show amplitude, dB, or both?
