# TE-003: Frequency To dB Analysis View

Status: `planned`

Kind: `Analysis View`

## Idea

Show `x = frequency`, preferably log or octave scaled; `y = dB`.

## Why It Matters

Frequency laws, amplitude slopes, damping, resonant peaks, and material signatures cannot be understood from sliders alone.

## Objects Affected

Partials, noise bands, law layers, selected audition stack.

## Controls

- graph scale: linear / log / octave
- selected stack source
- show raw nodes
- show law curve
- show resulting summed curve

## Graph View

Primary view is `frequency -> dB`.

## Audition Behavior

The displayed curve follows the same stack being auditioned.

## Implementation Slice

- Convert layer gains to dB.
- Draw nodes at log-frequency positions.
- Draw law curves when available.
- Draw selected-stack summed estimate.

## Verification

- Changing layer gain changes dB height.
- Changing anchor or ratio moves frequency positions.
- Soloing a layer changes the graph to that layer or stack.

## Open Questions

- How exact should the first spectrum estimate be before real FFT analysis exists?
