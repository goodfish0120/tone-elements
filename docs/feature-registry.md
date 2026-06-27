# Feature Registry

Updated: 2026-06-28

This file is the working registry for Tone Elements feature ideas. It exists so new messy ideas can be captured, sorted, planned, prototyped, and tested without pretending they are already implemented.

## Status

- `idea`: captured but not organized enough to build.
- `shaped`: sorted into a module type with expected controls and behavior.
- `planned`: has a concrete implementation slice and verification method.
- `prototype`: runnable in the app, but not trusted yet.
- `kept`: useful enough to keep as part of the tool.
- `parked`: not deleted, but not active.
- `cut`: tried and intentionally removed or abandoned.

## Feature Card Template

Use this shape whenever a new sound idea appears:

```text
ID:
Name:
Status:
Kind:
Idea:
Why it matters:
Objects affected:
Controls:
Graph view:
Audition behavior:
Implementation slice:
Verification:
Open questions:
```

## Buckets

- `Object Layer`: produces or represents sound objects such as partials, noise bands, event clouds, or surface-contact regions.
- `Law Layer`: rewrites or constrains other objects, like a design filter.
- `Motion Field`: drives pitch, phase, gain, density, or spatial movement over time.
- `Tail Shape`: controls how a sound disappears.
- `Analysis View`: visualizes frequency, dB, time, relations, or selected stacks.
- `Audition Workflow`: controls what the user hears and what graph stack is inspected.
- `Research Input`: uses real audio samples or spectra to infer useful rules.

## Current Feature Cards

### TE-001: Ratio Position Layer

Status: `prototype`

Kind: `Object Layer`

Idea: Generate discrete frequency nodes from an anchor frequency, rational ratio, octave shift, and cents offset.

Why it matters: This is the current mathematical microscope for building resonance positions instead of choosing vague descriptive presets.

Objects affected: Partial or resonance nodes.

Controls:

- anchor Hz
- numerator / denominator
- octave range
- cents offset
- gain
- attack / hold / release
- phase

Graph view: Frequency map exists, but it is not yet a proper `frequency -> dB` graph.

Audition behavior: Full stack playback exists. Solo exists at layer level, but selected-stack graph rendering is not complete.

Implementation slice: Existing `src/ratio-position/*`.

Verification:

- Candidate frequencies should match `anchorHz * (numerator / denominator) * 2^octave * 2^(offsetCents / 1200)`.
- Adding a candidate should create a right-side layer.

Open questions:

- Should ratio layers become one layer with many generated child nodes, instead of one layer per selected node?
- How should law layers target these nodes?

### TE-002: Right-Side Layer Stack Editor

Status: `shaped`

Kind: `Audition Workflow`

Idea: The right side should behave like a PCB/CAM or Photoshop layer/object stack, not like a passive list.

Why it matters: The tool needs many layer types and many controls; the stack is how users select, isolate, group, inspect, and audition complexity.

Objects affected: All layer types.

Controls:

- select
- enable / disable
- mute
- solo
- group
- remove
- inspect
- audition selected stack

Graph view: Center graphs should follow the same selected or auditioned stack.

Audition behavior: The user should be able to hear the full sound, a selected group, a solo layer, or combinations such as `anchor + noise`.

Implementation slice:

- Add selected layer state.
- Add mute separate from enable.
- Add group or tag metadata.
- Make renderer and graphs consume `auditionStack`.

Verification:

- Soloing or selecting a stack changes both playback and graphs.
- Whole-sound playback remains available.

Open questions:

- Do groups live as folders in the right stack, or as tags first?

### TE-003: Frequency To dB Analysis View

Status: `planned`

Kind: `Analysis View`

Idea: Show `x = frequency`, preferably log or octave scaled; `y = dB`.

Why it matters: Frequency laws, amplitude slopes, damping, resonant peaks, and material signatures cannot be understood from sliders alone.

Objects affected: Partials, noise bands, law layers, selected audition stack.

Controls:

- graph scale: linear / log / octave
- selected stack source
- show raw nodes
- show law curve
- show resulting summed curve

Graph view: Primary view is `frequency -> dB`.

Audition behavior: The displayed curve follows the same stack being auditioned.

Implementation slice:

- Convert layer gains to dB.
- Draw nodes at log-frequency positions.
- Draw law curves when available.
- Draw selected-stack summed estimate.

Verification:

- Changing layer gain changes dB height.
- Changing anchor or ratio moves frequency positions.
- Soloing a layer changes the graph to that layer or stack.

Open questions:

- How exact should the first spectrum estimate be before real FFT analysis exists?

### TE-004: Time To dB Envelope View

Status: `planned`

Kind: `Analysis View`

Idea: Show `x = time`; `y = dB`.

Why it matters: Attack, decay, release, water-drop tail, sticky tail, broken tail, and event lifecycles are only understandable when seen over time.

Objects affected: Envelopes, tail shapes, lifecycle events, selected audition stack.

Controls:

- selected stack source
- show individual layer curves
- show summed envelope estimate
- show event-cloud density over time

Graph view: Primary view is `time -> dB`.

Audition behavior: The graph follows the same layer stack being heard.

Implementation slice:

- Add envelope sampler functions.
- Draw per-layer and summed dB curves.
- Support tail-shape curves as reusable functions.

Verification:

- Changing attack / hold / release updates the graph.
- Soloing a layer changes the time graph.
- Tail shape choices visibly change curve morphology.

Open questions:

- Should time graph show amplitude, dB, or both?

### TE-005: Gain Law Layer

Status: `shaped`

Kind: `Law Layer`

Idea: A transform layer that adjusts gain according to a rule, like `gainDb = baseDb + slope * log2(frequency / anchor)`.

Why it matters: Many sound structures are controlled by physical or psychoacoustic rules rather than by hand-tuning every node.

Objects affected: Partial nodes, event-cloud events, possibly noise-band center frequencies.

Controls:

- target layer or group
- base dB
- dB per octave slope
- curve amount
- frequency pivot / anchor
- random deviation amount

Graph view: Shows the law curve and resulting node dB values in `frequency -> dB`.

Audition behavior: Can audition target layers with and without the law enabled.

Implementation slice:

- Add layer type `gain-law`.
- Add target selection by id, group, or all audible layers.
- Apply law before rendering.
- Draw law in frequency graph.

Verification:

- Positive slope makes higher nodes louder.
- Negative slope makes higher nodes softer.
- Disabling the law restores original gains.

Open questions:

- Should laws destructively rewrite generated nodes, or remain non-destructive modifiers?

### TE-006: Damping Law Layer

Status: `idea`

Kind: `Law Layer`

Idea: A rule that makes higher frequencies decay faster or slower than lower frequencies.

Why it matters: This is a common physical/material constraint and should not require manually editing every partial's release.

Objects affected: Partials, noise bands, event-cloud events.

Controls:

- target layer or group
- high-frequency decay scale
- low-frequency decay scale
- pivot frequency
- curve shape

Graph view: Appears in both `frequency -> dB` and `time -> dB`, because it changes decay by frequency.

Audition behavior: Compare original target stack against damped target stack.

Implementation slice:

- Compute per-object release multiplier from log-frequency.
- Apply to envelope sampling and renderer.

Verification:

- Higher nodes visibly end sooner in the time graph when high-frequency damping is strong.

Open questions:

- Should damping also reduce initial gain, or only affect decay?

### TE-007: Tail Shape Law

Status: `shaped`

Kind: `Tail Shape`

Idea: Tail shape is editable morphology, not only a generic release slider.

Why it matters: Water-drop, sticky, clean, dry, smeared, granular, broken, and rotten endings produce different meanings even when the same nodes are used.

Objects affected: Any audible layer or selected stack.

Controls:

- target layer or group
- shape type
- curvature
- rebound amount
- droplet ring amount
- smear amount
- zero-crossing cleanup

Graph view: `time -> dB` should show the exact tail curve.

Audition behavior: Can audition the same stack with different tail shapes.

Implementation slice:

- Add reusable tail curve functions.
- Add `tail-shape-law` layer.
- Apply the law to selected layer envelopes.

Verification:

- Water-drop tail has a visible rounded body and curved decay to zero.
- Clean tail reaches zero without a hard click.

Open questions:

- Should tail shape apply per layer or to a post-mix group envelope?

### TE-008: Lifecycle Event Cloud

Status: `idea`

Kind: `Object Layer`

Idea: Generate many small events with random but rule-bound lifecycles, like flame leaves, surface crackle, droplets, sand, cloth, or organic bubbling.

Why it matters: Many natural or material sounds are not single tones; they are many tiny births and deaths.

Objects affected: Event objects with time, frequency, gain, duration, envelope, motion, and randomness.

Controls:

- density
- lifetime range
- size range
- frequency range
- envelope shape
- pitch motion
- event correlation
- randomness seed

Graph view: Shows event density in `time -> dB` and event frequency distribution in `frequency -> dB`.

Audition behavior: Can audition event cloud alone or mixed with anchor/partials/noise.

Implementation slice:

- Add `event-cloud` layer type.
- Generate deterministic events from seed.
- Render each event as tone, filtered noise, or both.

Verification:

- Density increases event count.
- Lifetime changes visible event length and audible texture.
- Same seed produces same event pattern.

Open questions:

- Should fire, cloth, crackle, and bubbles be presets of event cloud or separate specialized layer types?

### TE-009: Noise Band Layer

Status: `idea`

Kind: `Object Layer`

Idea: A continuous noise region with center frequency, width, color, pressure, and filter shape.

Why it matters: Friction, breath, air, dirt, surface contact, and organic corruption need continuous regions, not only discrete partials.

Objects affected: Noise bands and filter regions.

Controls:

- center frequency
- bandwidth
- color
- filter type
- pressure
- roughness
- gain
- envelope

Graph view: Shows band region in `frequency -> dB`; envelope in `time -> dB`.

Audition behavior: Can audition noise band alone, with anchor, or with law layers.

Implementation slice:

- Add `noise-band` layer type.
- Render filtered noise with envelope.
- Draw band as a region, not a point.

Verification:

- Width changes graph region and audible texture.
- Pressure changes gain or density without hard clipping.

Open questions:

- Should pressure be a direct gain control or a driver that affects bandwidth and roughness too?

### TE-010: Surface Contact Layer

Status: `idea`

Kind: `Object Layer`

Idea: Model friction-like behavior from pressure, speed, roughness, stickiness, and changing contact.

Why it matters: Cloth, towel, leather, scraping, rubbing, and many object interactions are surface-contact sounds.

Objects affected: Noise bands, event clouds, motion fields.

Controls:

- pressure
- speed
- roughness
- stickiness
- contact area
- slip/stick amount
- material damping

Graph view: Shows pressure and density over time, plus noise-band change over frequency.

Audition behavior: Can isolate contact sound from tonal layers.

Implementation slice:

- Start as a preset combination of noise-band plus event-cloud plus laws.
- Later promote to its own specialized layer.

Verification:

- More pressure increases intensity.
- More speed shifts energy upward.
- More stickiness creates interrupted or elastic motion.

Open questions:

- Should surface contact be a high-level macro or a primitive layer?

### TE-011: Real Instrument Spectrum Study

Status: `idea`

Kind: `Research Input`

Idea: Analyze multiple instrument spectra to infer which rules are common and which are only imagined.

Why it matters: The project needs evidence from real spectra to make better physical and perceptual modules.

Objects affected: Spectral laws, damping laws, partial structures, material presets.

Controls:

- sample import
- f0 detection
- log-frequency alignment
- partial extraction
- decay extraction
- profile export

Graph view: Compare real `frequency -> dB` and `time -> dB` against synthetic modules.

Audition behavior: Later, audition reconstructed profile against original sample.

Implementation slice:

- Start with offline Python scripts or browser-based analysis.
- Extract simple peak lists and spectral tilt first.

Verification:

- Same instrument at different pitches aligns under `x = log2(f / f0)`.
- Extracted slope and peaks can be exported into law layers.

Open questions:

- Which open sample set should be used first?

## Next Sorting Pass

Before implementing the next large feature, pick one `planned` or `shaped` card and turn it into a runnable slice with:

- files to touch
- data model change
- UI controls
- graph behavior
- audio renderer behavior
- one listening test
- one visual verification test
