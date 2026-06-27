# Current Requirements

Updated: 2026-06-28

This file records the current practical requirements for the Tone Elements prototype.

## Engineering Direction

- The project still needs many controls. The answer is not to avoid knobs, but to organize them with stricter modules.
- Controls should edit mathematical and physical rules, not only isolated partials.
- Repeated sound-design rules such as frequency-position rules, amplitude laws, damping laws, grouping laws, motion fields, and noise-band rules should become first-class modules.
- The UI should not expose every parameter at once. It should let the user select a module or layer, then edit the relevant controls for that object.

## UI Mental Model

The interface should be designed more like PCB/CAM or Photoshop-style layered editing than like a simple music preset picker.

- The right side is the layer/object stack.
- The center view is the inspectable working surface.
- The controls edit the selected object, layer, rule, or stack.
- Layers can be enabled, muted, soloed, selected, grouped, and inspected.
- The user should be able to isolate a layer stack, inspect its graphs, audition it, then return to the full sound.
- The important workflow is constructive editing: add objects and laws, inspect their effect, then combine them into a sound.

## Required Analysis Views

The prototype needs visual views that make sound structure inspectable:

- Frequency spectrum view: `x = frequency`, preferably log-scaled or octave-scaled; `y = dB`.
- Time envelope view: `x = time`; `y = dB`.
- The displayed graph should follow the currently selected or auditioned layer set on the right, not always the whole sound.
- The user should be able to audition only a subset of right-side layers, such as `anchor + noise`, `anchor + ratio responses`, or `noise only`.

These views are required because many controls only make sense if the user can see whether a frequency law, amplitude slope, decay rule, or envelope shape is actually doing what it claims.

## Near-Term Implication

The next prototype should not keep adding descriptive preset buttons. It should expose a small number of strict module types and show their effect on `frequency -> dB` and `time -> dB` graphs.

The right-side layer list should become the audition and inspection surface:

- Select a layer to edit its parameters.
- Enable, mute, or solo layers to define the current audition stack.
- Render the frequency and time graphs from that same audition stack.
- Keep whole-sound playback available, but make partial-stack playback easy because many rules only become understandable when isolated.
