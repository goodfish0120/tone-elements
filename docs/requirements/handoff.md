# Handoff

Updated: 2026-06-28

This is the first fresh-context handoff for Tone Elements. Read this before implementing new work.

## Repository

- Local repo: `C:\CodeX\sound-lab`
- GitHub repo: `https://github.com/goodfish0120/tone-elements`
- Public demo: `https://goodfish0120.github.io/tone-elements/`
- Current prototype page: `https://goodfish0120.github.io/tone-elements/lab/layer-stack-lab.html`

Before editing, verify:

```powershell
git status -sb
git log --oneline -5
```

The active local branch used during the first handoff was `codex/ratio-position-sync`, tracking `origin/main`.

## Fresh Context Read Order

1. `README.md`
2. `docs/requirements/index.md`
3. `docs/requirements/current-plan.md`
4. `docs/requirements/module-taxonomy.md`
5. The cards linked by the active queue in `current-plan.md`
6. Only then inspect app files under `lab/` and `src/`

Do not reconstruct project direction from chat if the repo files are available.

## Current Truth

Tone Elements is not a small MVP and not a generic music generator. It is intended to become a broad, AI-assisted, modular sound-structure workbench.

Core idea:

- Many messy sound ideas are allowed.
- Ideas should become inspectable modules, laws, layers, views, or workflows.
- Complexity is controlled through module schemas, grouping, audition, and graph inspection.
- The UI metaphor is closer to PCB/CAM or Photoshop layer editing than to a music preset picker.

The right side should become the layer/object stack. The center should become the inspectable working surface. Controls should edit the currently selected layer, law, object, or stack.

## Implemented Now

Current runnable implementation:

- Ratio position prototype under `src/ratio-position/*`.
- Page shell at `lab/layer-stack-lab.html`.
- Basic right-side layer list.
- Basic enable / solo / remove controls.
- Play, JSON export, WAV export.

The formula already used by the ratio prototype:

```text
frequency = anchorHz * (numerator / denominator) * 2^octave * 2^(offsetCents / 1200)
```

## Important Naming Caveat

`lab/layer-stack-lab.html` is now the public prototype entry, but the file name is historical. The current implementation loaded by that page is the ratio-position prototype, not the old descriptive layer-stack experiment.

The old `src/layer-stack/*` files still exist. Treat them as legacy/reference unless a current card explicitly asks to reuse them.

## Planned But Not Implemented

Do not claim these are implemented yet:

- real `frequency -> dB` graph
- real `time -> dB` graph
- graph rendering from selected or auditioned stack
- mute separate from enable
- grouped audition stack
- `gain-law` layer
- `damping-law` layer
- tail-shape morphology such as water-drop tail
- noise-band layer
- lifecycle event cloud
- surface-contact layer
- real instrument spectrum study

## Current Queue

The active queue lives in `docs/requirements/current-plan.md`.

Current order:

1. Q1: Make the right-side stack actually drive playback and graph inspection.
2. Q2: Add the first law layer, starting with `gain-law`.
3. Q3: Add tail-shape morphology.
4. Q4: Add first continuous/cloud objects, such as noise band and event cloud.
5. Q5: Start real-audio spectrum study.

If implementing next, start with Q1 unless the user explicitly redirects.

## Feature Card Rule

When a new idea appears:

1. Create or update a card under `docs/requirements/cards/`.
2. Give it a `TE-xxx` id.
3. Assign a status from `module-taxonomy.md`.
4. Add controls, graph behavior, audition behavior, implementation slice, and verification.
5. Only add it to `current-plan.md` if it is actually queued.

## Design Boundaries

- Keep the framing scientific, psychoacoustic, mathematical, and game-audio oriented.
- Avoid mystical, New Age, alien, or lizard-person framing.
- Do not collapse the project into a tiny emotion grid.
- Do not reduce broad exploration into "make a very small thing" unless the user explicitly asks for a scoped implementation slice.
- Do not expose every control at once. Use selected-layer editing and capability schemas.

## Next Implementation Shape

The next useful implementation is not another descriptive preset. It should make the current prototype obey the handoff structure:

- right-side layer selection
- mute separate from enable
- an `auditionStack` helper
- `frequency -> dB` graph for the audition stack
- `time -> dB` graph for the audition stack

This corresponds to Q1 and cards:

- `TE-002-right-side-layer-stack-editor.md`
- `TE-003-frequency-to-db-analysis-view.md`
- `TE-004-time-to-db-envelope-view.md`

## Verification Expectations

For any implementation:

- Run JS syntax checks for changed scripts.
- Open the local or public page and verify there are no console errors.
- Verify that playback and graphs follow the same selected/auditioned stack.
- Verify at least one visual behavior and one audible behavior.
- Keep docs updated if the implemented scope changes status or queue order.
