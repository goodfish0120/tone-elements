# Module Taxonomy

Updated: 2026-06-28

This file defines the buckets used to sort Tone Elements feature ideas.

## Status Values

- `idea`: captured but not organized enough to build.
- `shaped`: sorted into a module type with expected controls and behavior.
- `planned`: has a concrete implementation slice and verification method.
- `prototype`: runnable in the app, but not trusted yet.
- `kept`: useful enough to keep as part of the tool.
- `parked`: not deleted, but not active.
- `cut`: tried and intentionally removed or abandoned.

## Feature Buckets

- `Object Layer`: produces or represents sound objects such as partials, noise bands, event clouds, or surface-contact regions.
- `Law Layer`: rewrites or constrains other objects, like a design filter.
- `Motion Field`: drives pitch, phase, gain, density, or spatial movement over time.
- `Tail Shape`: controls how a sound disappears.
- `Analysis View`: visualizes frequency, dB, time, relations, or selected stacks.
- `Audition Workflow`: controls what the user hears and what graph stack is inspected.
- `Research Input`: uses real audio samples or spectra to infer useful rules.

## Layer Capability Rule

Layers are not all the same kind of audio track. Each layer type has its own object model, parameters, and allowed operations.

Shared controls can include:

- select
- enable / disable
- mute
- solo
- group
- inspect
- remove

Layer-specific controls must come from that layer type's capability schema.

Examples:

- A partial layer exposes ratio, octave, cents, gain, phase, and envelope controls.
- A noise-band layer exposes center frequency, width, color, pressure, roughness, and filter shape.
- An event-cloud layer exposes density, lifecycle, frequency range, event motion, correlation, and seed.
- A law layer exposes target selection and the rule parameters it applies.

## Design Filter Rule

Some modules do not directly create sound. They act like design filters over selected objects.

Examples:

- `gain-law`
- `damping-law`
- `tail-shape-law`
- group envelope
- density law
- motion field

These should remain inspectable and disable-able. If a law modifies output, the graph must show both the original idea and the resulting effect whenever possible.
