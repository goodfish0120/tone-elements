# Current Plan

Updated: 2026-06-28

This file records the current development direction and the queue of work that should be considered next. It is not a proof that all listed features are implemented.

## Current Development Direction

Build an expandable layered editor for sound structure:

- Many ideas are allowed.
- Each idea should become an inspectable module, law, layer, view, or workflow.
- Complexity is controlled by module schemas, grouping, audition, and graph inspection.
- The UI should edit selected objects instead of showing every control at once.
- The right-side stack is the main audition and inspection surface.
- The center surface should show `frequency -> dB` and `time -> dB` views for the selected or auditioned stack.

## Current Prototype State

Implemented:

- `TE-001`: Ratio Position Layer exists as the current `src/ratio-position/*` prototype.
- Basic right-side layer list exists.
- Basic enable / solo / remove controls exist.
- Basic play, JSON, and WAV export exist.

Naming caveat:

- `lab/layer-stack-lab.html` is the current public prototype entry, but the file name is historical.
- The current page loads `src/ratio-position/*`.
- `src/layer-stack/*` is legacy/reference unless an active card explicitly reuses it.

Not yet implemented:

- Real `frequency -> dB` view.
- Real `time -> dB` view.
- Selected-stack graph rendering.
- Mute separate from enable.
- Grouped audition stack.
- Law layers such as gain law and damping law.
- Tail shape morphology.
- Noise band, lifecycle event cloud, and surface contact layers.

## Active Queue

### Q1: Make The Stack Actually Drive Inspection

Cards:

- [TE-002](cards/TE-002-right-side-layer-stack-editor.md): Right-Side Layer Stack Editor
- [TE-003](cards/TE-003-frequency-to-db-analysis-view.md): Frequency To dB Analysis View
- [TE-004](cards/TE-004-time-to-db-envelope-view.md): Time To dB Envelope View

Goal: right-side selection, solo, mute, and audition stack should determine what is heard and what is graphed.

Runnable slice:

- Add selected layer state.
- Add mute separate from enable.
- Add an `auditionStack` helper.
- Draw a first `frequency -> dB` estimate from the audition stack.
- Draw a first `time -> dB` envelope estimate from the audition stack.

Verification:

- Selecting or soloing a layer changes both playback and graphs.
- Whole-sound playback remains available.
- Graphs do not show disabled or muted layers in audition mode.

### Q2: Add The First Law Layer

Cards:

- [TE-005](cards/TE-005-gain-law-layer.md): Gain Law Layer
- [TE-006](cards/TE-006-damping-law-layer.md): Damping Law Layer

Goal: prove that a layer can act like a design filter over selected objects.

Runnable slice:

- Add `gain-law` as a non-audio layer.
- Target all ratio/partial layers or a selected group.
- Apply `gainDb = baseDb + slope * log2(frequency / anchor)` before rendering.
- Draw the law curve in `frequency -> dB`.

Verification:

- Negative slope makes higher partials softer.
- Positive slope makes higher partials louder.
- Disabling the law restores original gain.

### Q3: Add Tail Shape Morphology

Cards:

- [TE-007](cards/TE-007-tail-shape-law.md): Tail Shape Law
- [TE-004](cards/TE-004-time-to-db-envelope-view.md): Time To dB Envelope View

Goal: make tail shape visible and audible as a morphology, not just a release slider.

Runnable slice:

- Add reusable tail curve functions.
- Add `clean`, `water-drop`, `sticky`, and `broken` tail shapes.
- Apply a selected tail shape to a target layer or stack.
- Show its curve in `time -> dB`.

Verification:

- Water-drop tail has a rounded body, small resonant ring, and curved decay to zero.
- Clean tail reaches zero without a click.

### Q4: Add First Continuous / Cloud Object

Cards:

- [TE-008](cards/TE-008-lifecycle-event-cloud.md): Lifecycle Event Cloud
- [TE-009](cards/TE-009-noise-band-layer.md): Noise Band Layer
- [TE-010](cards/TE-010-surface-contact-layer.md): Surface Contact Layer

Goal: stop treating every sound as only discrete partials.

Runnable slice:

- Start with one `noise-band` layer and one deterministic `event-cloud` layer.
- Give both independent audition.
- Draw frequency regions and event distribution.

Verification:

- Noise-band width changes graph region and audible texture.
- Event-cloud density changes event count and visible envelope density.
- Same seed produces the same event pattern.

### Q5: Start Evidence From Real Audio

Cards:

- [TE-011](cards/TE-011-real-instrument-spectrum-study.md): Real Instrument Spectrum Study

Goal: use real spectra to inform law and material modules.

Runnable slice:

- Start with one offline analysis script or browser import experiment.
- Extract f0, peaks, and a rough spectral tilt.
- Export the result into a profile that can become law layers.

Verification:

- Same instrument at different pitches aligns under `x = log2(f / f0)`.
- Extracted slope can be drawn in `frequency -> dB`.

## Queue Rule

Only `planned` or `shaped` cards should enter the active queue. `idea` cards can stay in `cards/` until they have a concrete implementation slice.
