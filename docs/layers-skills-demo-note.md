# Layers Skills Upgrade Demo Note

For Complementary recording: Jamie Mill's latest Layers skills are now vendored in this repo at `.claude/skills/layers-*`.

Source checked: `jamiemill/layers-skills` at `a201dc8` (`Add "push forward, pull back" and provisional-object disciplines`).

Repo-local baseline: there were no checked-in `layers-*` skill prompts before this upgrade, so the repo diff is a new vendored skill package. The prompt/output comparison below is against the upstream pre-reduction prompt set.

## What Changed

- The biggest change is restraint: upstream diff from the pre-reduction prompt set to current is `297 insertions / 743 deletions` across the nine skills.
- The skills are reframed as technique libraries, not pipelines. They should find the live decision, offer one or two fitting techniques, and stop there.
- Output is now opt-in and lightweight: capture decisions, surfaced questions, and open risks, not a transcript or full report.
- New principle: "Push forward, pull back." If lower-layer modelling feels abstract, briefly probe an upper layer to learn what the lower layer actually needs, then return.
- Conceptual model work now explicitly marks provisional objects when they depend on unvalidated strategy bets or unclear flows.

## Prompt/Output Diff

Before:
- Run a guided session phase by phase.
- Produce every listed artifact by default.
- Treat each skill as a complete workflow.
- Ask where to save outputs at the start and write a session summary at the end.

After:
- Identify the live decision first.
- Choose the smallest technique that fits.
- Capture only durable residue: decisions made, decisions surfaced, open questions.
- Save a short summary only when it is useful or requested.

## Recording Talking Points

- "The upgrade makes the skills less eager."
- "The old version wanted to complete the whole layer; the new version helps with the next real decision."
- "The important line is: capture decisions, not transcripts."
- "Push forward, pull back gives agents permission to glance up a layer without pretending the upper layer is settled."
- "For Reality Stock Watch, this should mean shorter design docs and fewer speculative objects."

## Quick Demo Move

Use `/layers-conceptual-model` on one unresolved app question, such as whether a `Survey Result` should be a first-class object or just a report view.

Expected behavior:
- Ask what decision is live.
- Offer a fitting technique, probably object definition or sketch-the-flow-first.
- Mark the object provisional if it only exists because of an untested product bet.
- End with a few decisions and open questions, not a full conceptual model rewrite.
