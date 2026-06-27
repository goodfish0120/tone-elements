# Current Requirements

Updated: 2026-06-28

This file records the current practical requirements for the Tone Elements prototype.

## Engineering Direction

- The project still needs many controls. The answer is not to avoid knobs, but to organize them with stricter modules.
- Controls should edit mathematical and physical rules, not only isolated partials.
- Repeated sound-design rules such as frequency-position rules, amplitude laws, damping laws, grouping laws, motion fields, and noise-band rules should become first-class modules.
- The UI should not expose every parameter at once. It should let the user select a module or layer, then edit the relevant controls for that object.

## Required Analysis Views

The prototype needs visual views that make sound structure inspectable:

- Frequency spectrum view: `x = frequency`, preferably log-scaled or octave-scaled; `y = dB`.
- Time envelope view: `x = time`; `y = dB`.

These views are required because many controls only make sense if the user can see whether a frequency law, amplitude slope, decay rule, or envelope shape is actually doing what it claims.

## Near-Term Implication

The next prototype should not keep adding descriptive preset buttons. It should expose a small number of strict module types and show their effect on `frequency -> dB` and `time -> dB` graphs.
