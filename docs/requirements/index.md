# Requirements Index

Updated: 2026-06-28

This folder is the modular requirements system for Tone Elements. Use it to keep messy sound ideas sorted into readable planning files and runnable feature cards.

## Read Order

1. [current-plan.md](current-plan.md): current direction, active queue, and implementation order.
2. [handoff.md](handoff.md): fresh-context entry, current truth, caveats, and next implementation shape.
3. [module-taxonomy.md](module-taxonomy.md): the buckets and layer/module types used to sort ideas.
4. [feature-card-template.md](feature-card-template.md): the shape for new feature ideas.
5. [cards/](cards/): detailed feature cards.
6. [../current-requirements.md](../current-requirements.md): summary of the current product and engineering requirements.

## Current Direction

Tone Elements should become a broad, AI-assisted, modular sound-structure workbench. The goal is not to keep the prototype small. The goal is to turn many sound ideas into inspectable modules quickly, then decide through listening and graphs what should stay.

Core UI metaphor: PCB/CAM or Photoshop-like layered editing.

- Right side: layer/object stack.
- Center: inspectable working surface.
- Controls: edit the selected layer, rule, object, or stack.
- Graphs: show the selected/auditioned stack.

## Active Planning Files

- [current-plan.md](current-plan.md): active queue and next implementation slices.
- [handoff.md](handoff.md): fresh-context handoff and implementation caveats.
- [module-taxonomy.md](module-taxonomy.md): object layers, law layers, motion fields, tail shapes, analysis views, audition workflows, research inputs.
- [feature-card-template.md](feature-card-template.md): required fields for new TE cards.

## Feature Cards

- [TE-001 Ratio Position Layer](cards/TE-001-ratio-position-layer.md)
- [TE-002 Right-Side Layer Stack Editor](cards/TE-002-right-side-layer-stack-editor.md)
- [TE-003 Frequency To dB Analysis View](cards/TE-003-frequency-to-db-analysis-view.md)
- [TE-004 Time To dB Envelope View](cards/TE-004-time-to-db-envelope-view.md)
- [TE-005 Gain Law Layer](cards/TE-005-gain-law-layer.md)
- [TE-006 Damping Law Layer](cards/TE-006-damping-law-layer.md)
- [TE-007 Tail Shape Law](cards/TE-007-tail-shape-law.md)
- [TE-008 Lifecycle Event Cloud](cards/TE-008-lifecycle-event-cloud.md)
- [TE-009 Noise Band Layer](cards/TE-009-noise-band-layer.md)
- [TE-010 Surface Contact Layer](cards/TE-010-surface-contact-layer.md)
- [TE-011 Real Instrument Spectrum Study](cards/TE-011-real-instrument-spectrum-study.md)

## Rule For New Ideas

When a new idea appears, do not bury it in chat or append it to a long prose file. Create or update a feature card, assign a status, and connect it to the current plan only if it is actually queued.
