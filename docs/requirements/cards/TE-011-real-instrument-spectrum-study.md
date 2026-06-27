# TE-011: Real Instrument Spectrum Study

Status: `idea`

Kind: `Research Input`

## Idea

Analyze multiple instrument spectra to infer which rules are common and which are only imagined.

## Why It Matters

The project needs evidence from real spectra to make better physical and perceptual modules.

## Objects Affected

Spectral laws, damping laws, partial structures, material presets.

## Controls

- sample import
- f0 detection
- log-frequency alignment
- partial extraction
- decay extraction
- profile export

## Graph View

Compare real `frequency -> dB` and `time -> dB` against synthetic modules.

## Audition Behavior

Later, audition reconstructed profile against original sample.

## Implementation Slice

- Start with offline Python scripts or browser-based analysis.
- Extract simple peak lists and spectral tilt first.

## Verification

- Same instrument at different pitches aligns under `x = log2(f / f0)`.
- Extracted slope and peaks can be exported into law layers.

## Open Questions

- Which open sample set should be used first?
