# a2o Architecture — Revit Transition & Drafting Pilot

Keys2TheWeb client work for **a2o Architecture** (Key West, FL).

a2o is moving from AutoCAD LT to Revit. This repo holds Keys2TheWeb's side of that
transition: standards, the AI note/spec/schedule helper, rollout coordination, and
(later) any custom automation scoped from what Revit leaves undone.

Source of truth for scope: `docs/proposals/2026-10-13_Revit_Transition_Drafting_Pilot_Proposal.pdf`.

**Phase 0 deliverable in progress:** the [a2o Draft Assistant](draft-assistant/) web app
(General Notes, Spec Sections, Schedules grounded on a2o's examples). Setup and status in
`draft-assistant/README.md` and `draft-assistant/HANDOFF.md`.

## Phases

| Phase | Folder | What it covers | Status |
|---|---|---|---|
| 0 — Interim relief | `phase-0-interim-relief/` | Standardize a2o's current 2D kit (title blocks, block library, layer + annotation standards); stand up an AI note/spec/schedule helper usable alongside LT | Proposed |
| 1 — Standards & rollout coordination | `phase-1-revit-standards/` | Encode a2o's drafting standards into the Revit templates (layers/line styles, annotation, dimensioning, title blocks); AI-drafted standards docs; rollout timeline + checkpoints | Proposed |
| 2 — Automation assessment (optional) | `phase-2-automation-assessment/` | After a real Revit project: document what Revit handles well vs. poorly for a2o's work, identify gaps worth a custom tool, quote from evidence | Proposed |

Out of scope for Keys2TheWeb: the core Revit setup (project templates, family library,
team training) is a2o's own track, and the architect's review and stamp stays with a2o's
licensed architect. Autodesk subscriptions are contracted and paid by a2o directly.

## Layout

```
draft-assistant/               a2o Draft Assistant web app (Next.js + Postgres + Clerk + Anthropic)
client-inputs/                 a2o's current drafting standards + 2-3 typical past projects (needed to start)
docs/proposals/                Proposals and SOWs as sent
phase-0-interim-relief/
  2d-kit-standards/            Standardized title blocks, blocks/library, layer + annotation standards
  note-spec-helper/            AI general-notes / spec-section / schedule drafting helper
phase-1-revit-standards/
  templates/                   Revit template standards work (line styles, annotation, dimensioning, title blocks)
  standards-docs/              AI-drafted drafting standards documentation for the team
phase-2-automation-assessment/ Revit gap findings and any custom-tool scope/quote
```

## Working rules

- Nothing here automates *inside* AutoCAD LT (that tier can't be extended). Phase 0 is relief around it, built so none of the work is wasted when Revit lands.
- Revit and any tool built here produce drafts only. a2o's architect reviews and stamps all output.
- Client-supplied drawings and standards go in `client-inputs/` and are not redistributed.
- Keep large binaries (DWG, RVT, RFA, PDFs beyond the proposal) out of git unless they are deliverables; use the shared Drive folder for working files.

## Contacts

- Keys2TheWeb: Nick Grassi · nick@keys2theweb.com · Key Largo, FL
- Client: a2o Architecture, Key West
