# TE-002: Right-Side Layer Stack Editor

Status: `shaped`

Kind: `Audition Workflow`

## Idea

The right side should behave like a PCB/CAM or Photoshop layer/object stack, not like a passive list.

## Why It Matters

The tool needs many layer types and many controls; the stack is how users select, isolate, group, inspect, and audition complexity.

## Objects Affected

All layer types.

## Controls

- select
- enable / disable
- mute
- solo
- group
- remove
- inspect
- audition selected stack

## Graph View

Center graphs should follow the same selected or auditioned stack.

## Audition Behavior

The user should be able to hear the full sound, a selected group, a solo layer, or combinations such as `anchor + noise`.

## Implementation Slice

- Add selected layer state.
- Add mute separate from enable.
- Add group or tag metadata.
- Make renderer and graphs consume `auditionStack`.

## Verification

- Soloing or selecting a stack changes both playback and graphs.
- Whole-sound playback remains available.

## Open Questions

- Do groups live as folders in the right stack, or as tags first?
