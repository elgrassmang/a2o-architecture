# AI note / spec / schedule helper (Phase 0)

Built as the **a2o Draft Assistant** web app in [`/draft-assistant`](../../draft-assistant/).
See its README for setup, how grounding works, and how to load a2o's real examples;
see its HANDOFF.md for what is done and what still needs a2o.

Design constraints (from the proposal):
- Output is plain text the team pastes into their sheets; nothing automates inside AutoCAD LT.
- Grounded in a2o's own standards and past projects (`client-inputs/`), not generic boilerplate.
- Everything it produces is a draft for the architect's review and stamp.
