# Current Requirements

Updated: 2026-06-28

This file records the current practical requirements for the Tone Elements prototype.

## Engineering Direction

- The project still needs many controls. The answer is not to avoid knobs, but to organize them with stricter modules.
- The goal is not to artificially keep the prototype small. The project should use AI-assisted development to quickly materialize many messy sound ideas so they can be heard, inspected, compared, and either kept or discarded.
- Controls should edit mathematical and physical rules, not only isolated partials.
- Repeated sound-design rules such as frequency-position rules, amplitude laws, damping laws, grouping laws, motion fields, and noise-band rules should become first-class modules.
- The UI should not expose every parameter at once. It should let the user select a module or layer, then edit the relevant controls for that object.

## Exploration Policy

This project is allowed to be broad. Many speculative layer types, laws, fields, and controls should be implemented as experiments instead of being rejected only because they make the system larger.

- Capture every plausible sound operation as an inspectable module or experimental capability.
- Use modular boundaries, schemas, naming, grouping, and audition tools to contain complexity.
- Prefer quickly making an idea audible and visible over debating whether it belongs in a minimal product.
- Keep failed or weak ideas easy to disable, hide, replace, or delete.
- Treat AI as the acceleration layer: messy ideas should become runnable prototypes fast enough that listening and graph inspection can decide their value.
- Detailed feature ideas, implementation slices, and verification notes should be sorted under `docs/requirements/` instead of being buried in this summary.

## UI Mental Model

The interface should be designed more like PCB/CAM or Photoshop-style layered editing than like a simple music preset picker.

- The right side is the layer/object stack.
- The center view is the inspectable working surface.
- The controls edit the selected object, layer, rule, or stack.
- Layers can be enabled, muted, soloed, selected, grouped, and inspected.
- The user should be able to isolate a layer stack, inspect its graphs, audition it, then return to the full sound.
- The important workflow is constructive editing: add objects and laws, inspect their effect, then combine them into a sound.

## Layer Types And Capabilities

Layers are not all the same kind of audio track. Each layer type has its own object model, parameters, and allowed operations.

- Resonance or partial layers edit discrete frequency nodes and ratio relationships.
- Spectral law layers edit frequency-to-amplitude rules, slopes, peaks, and damping behavior.
- Noise-band layers edit continuous frequency regions, width, color, pressure, and filter shape.
- Lifecycle or event-cloud layers edit many small events with birth, growth, motion, decay, density, and randomness rules.
- Surface-contact layers edit friction-like behavior such as pressure, speed, roughness, stickiness, and contact changes.
- Envelope or motion layers edit time functions that can drive other objects instead of producing sound directly.
- Transform or law layers act like filters over selected objects: they may not create sound directly, but they can rewrite gain, dB slope, decay, pitch motion, density, or other parameters according to rules.

The UI should reflect the selected layer type. A partial layer should not expose the same controls as a noise band or event cloud. Each layer card can share common controls such as enable, mute, solo, select, group, and inspect, but the editable parameters below it should come from that layer type's capability schema.

## Filter-Like Laws And Tail Shapes

Some modules should behave like design filters rather than audio tracks. They apply a rule to an existing set of nodes, bands, or events.

Examples:

- Gain law: adjust volume from a frequency or time rule, such as `gainDb = baseDb + slope * log2(frequency / anchor)`.
- Damping law: make higher frequencies decay faster than lower frequencies.
- Group law: force a set of partials or events to share an envelope, phase relationship, or motion field.
- Density law: change how many lifecycle events appear over time.
- Tail-shape law: rewrite how selected layers disappear.

Tail shape should be treated as an editable morphology, not only a generic release slider. For example, a water-drop-like tail may use a rounded attack, short elastic body, resonant droplet ring, and curved decay to zero. Other tails may be dry, smeared, sticky, granular, broken, or clean. These tail shapes should be visible in the `time -> dB` graph and audible through right-side layer audition.

## Required Analysis Views

The prototype needs visual views that make sound structure inspectable:

- Frequency spectrum view: `x = frequency`, preferably log-scaled or octave-scaled; `y = dB`.
- Time envelope view: `x = time`; `y = dB`.
- The displayed graph should follow the currently selected or auditioned layer set on the right, not always the whole sound.
- The user should be able to audition only a subset of right-side layers, such as `anchor + noise`, `anchor + ratio responses`, or `noise only`.

These views are required because many controls only make sense if the user can see whether a frequency law, amplitude slope, decay rule, or envelope shape is actually doing what it claims.

## Near-Term Implication

The next prototype should not keep adding descriptive preset buttons. It should expose an expandable module system and show each module's effect on `frequency -> dB` and `time -> dB` graphs.

The right-side layer list should become the audition and inspection surface:

- Select a layer to edit its parameters.
- Enable, mute, or solo layers to define the current audition stack.
- Render the frequency and time graphs from that same audition stack.
- Keep whole-sound playback available, but make partial-stack playback easy because many rules only become understandable when isolated.
