# Revit Transition & Drafting Pilot: the plan and the price

Prepared by Keys2TheWeb for a2o Architecture · October 16, 2026

## The short version

a2o is moving from AutoCAD LT to Revit. This plan does the work that has to happen
anyway, early and in the right order: take the repetitive writing off the drafters,
get a2o's drafting standards written down, carry those standards into Revit, and then
look at what is still worth automating once a real project has been through Revit.

Most of the AI help a2o will want inside Revit is either coming from Autodesk itself
or available free through add-ins. Keys2TheWeb builds only what those tools cannot
supply: a2o's own standards, a2o's voice, and the Florida Keys and HARC specifics.
Buy the generic, build the specific. That is what keeps the price where it is.

**All three phases: $6,000, with $3,000 to begin.** Bought separately they come to
$7,000 to $8,000. Each phase is still a separate decision; a2o can stop after any one
with a finished result in hand.

## Phase 0: interim relief (starts now)

**1. The a2o Draft Assistant.** A private web tool for the team that drafts General
Notes, Specification Sections, and Schedules in a2o's own voice, working from a2o's
past documents rather than generic boilerplate. Type a short brief and the project
facts, get a draft, edit it, copy it onto the sheet. Save good ones and reuse them on
the next project. Built around a2o's real notes and specs from the start, then tuned
side by side with a drafter on a live project until it earns its place.

**2. a2o's drafting standards, one page per item.** Title block, layers and line
weights, block library, annotation, and note language, reviewed by a2o's lead drafter
and handed over as a2o's own document. It is the first thing any Revit template setup
asks for.

**3. Overflow drafting help during the changeover**, up to 10 hours inside Phase 0.

**What Phase 0 is not.** It does not build Revit templates or family libraries, and it
does not automate inside AutoCAD LT, which cannot be extended. It is relief around LT,
built so nothing is wasted when Revit arrives. The Draft Assistant's output is plain
text that works on an LT sheet today and in a Revit sheet or schedule tomorrow.

## Phase 1: standards into Revit (when a2o is on Revit)

Apply a2o's documented standards to Autodesk's stock residential template through a
repeatable script, so the template can be regenerated whenever the standard changes.
Line styles, text and dimension styles, title block content, sheet sets, view
structure, standard notes, and schedule layouts. Plus coordination of the rollout:
timeline, checkpoints, and keeping conventions consistent from LT through Revit.

Workstation readiness, licensing, installs, file storage and backup, and add-in setup
are included in Phase 1 (see the IT setup page). Revit training and modeling practice
stay on a2o's track (in-house, a Revit specialist, or Autodesk onboarding). Building a
template or family library from scratch is outside this phase and quoted separately
if wanted.

## Phase 2: automation assessment (after one real Revit project)

Document what Revit and the free tools handle well for a2o's work and what they leave
undone. Identify the gaps worth a custom tool, if any, and quote that build from
evidence. The likeliest candidate is a converter that turns a2o's own standardized
DWGs into Revit models by layer and block name. Phase 2 delivers a written assessment
and a quote; any build is its own decision.

## Where Claude and NonicaTab fit

**NonicaTab** is a free Revit add-in (Autodesk Marketplace, Revit 2020 through 2027).
Its AI Connector lets Claude work directly on the open Revit model through about fifty
predefined actions. According to Nonica's listing, those cover reading and checking the
model, selecting and editing elements in bulk (renumbering, renaming, filling in
parameters), and documentation setup (creating sheets and sections, placing views,
bulk duplicating and renaming). It does not draw walls or place doors. Exact
capabilities should be confirmed in Claude's tool list after installing.

For a2o this means the tedious half of template and sheet-set assembly can be driven
by Claude from the standards document, the Draft Assistant's notes and schedules have
a path into Revit without retyping, and everyday chores ("renumber the doors on level
2," "find every room with no finish") stop costing drafter time. Repeatable work that
must come out identical every time, such as applying the standard to the template, is
done with a script instead, which is Keys2TheWeb's part.

**Revit itself is adding AI.** Autodesk's 2027 release includes an assistant inside
Revit for sheet and schedule management, element operations, automated documentation,
and drawing-compliance checks. a2o should start on the newest Revit it can get.

**Sketch-to-model tools** such as Civly exist at roughly A$2,000 per seat per month,
with code checks for Australian, US IBC, and EU codes but nothing for the Florida
Building Code, flood and wind provisions, or HARC. Worth a look later; not something
to build.

## Why this saves money over time

- **Nothing is paid for twice.** General-purpose Revit AI is coming from Autodesk and
  free add-ins. Keys2TheWeb's fee buys only what no vendor sells: a2o's voice, a2o's
  standards, Keys and HARC specifics, and the glue between tools.
- **The standards pay three times.** Written once in Phase 0, they feed the Draft
  Assistant now, the Revit template in Phase 1, and any DWG conversion later. Without
  them each of those is a separate discovery exercise.
- **Drafter hours, in a2o's numbers.** Two to three hours saved per project on notes,
  specs, and schedules, across a normal year of projects, repays Phase 0 several times
  over before the Revit work begins. Fewer stale copy-paste errors come free.

| Input | a2o's number |
|---|---|
| Hours per project now spent writing or copy-editing notes, specs, and schedules | ____ |
| Hours per project with the Draft Assistant | ____ |
| Projects per year | ____ |
| Loaded hourly cost of a drafter | ____ |

## Investment and payment

| Phase | Scope | Separately | In this plan |
|---|---|---|---|
| 0 | Draft Assistant, standards, up to 10 hrs overflow | $3,000 | $3,000 to begin |
| 1 | Standards into Revit template, rollout coordination | $1,500 to $2,500 | $1,500 when Phase 1 starts |
| 2 | Written automation assessment and quote | $2,500 | $1,500 on delivery |
| | **Total** | **$7,000 to $8,000** | **$6,000** |

Not included: Autodesk subscriptions (paid by a2o directly), core Revit setup and
training, building a template or family library from scratch, any custom tool Phase 2
recommends, and the optional care plan (from $300 per month, separate).

Phase 1 begins whenever a2o is ready in Revit; nothing is billed for it until then.

<!-- pagebreak -->

# Revit IT setup: included in Phase 1

Setting up Revit is two different jobs. The IT side is Keys2TheWeb's trade and is
included in Phase 1 at no extra charge. The Revit-practice side (how a2o models,
trains, and organizes projects) belongs with a Revit specialist or Autodesk onboarding.
Keeping that line clear is what keeps the setup short and the result dependable.

## Included: the IT side

- **Workstation readiness.** Check each machine against Autodesk's published
  requirements for the Revit version a2o buys. Revit is far heavier than AutoCAD LT:
  64-bit Windows, a dedicated graphics card, 32 GB of RAM is comfortable, solid-state
  storage. A machine that runs LT well may not run Revit well. Finding that out before
  go-live is the single most valuable item on this page.
- **Licensing and accounts.** Autodesk account, named-user licenses per seat, one admin
  login that is a2o's rather than any one drafter's, installs and updates.
- **Where project files live.** Revit files are large and single-user unless
  worksharing is configured. A shared location (local server or Autodesk's cloud), a
  folder structure that matches the standards document, and backups that run and are
  tested.
- **Add-ins on every seat.** NonicaTab (free) and pyRevit (free), with the Claude
  connection confirmed on one machine before rollout.
- **A rollback plan.** AutoCAD LT stays installed and licensed until the first Revit
  project is delivered.

Typical effort for a small office: one to two days, much of it waiting on installers.

## Not included: the Revit-practice side

- Training the drafters to model in Revit.
- Deciding modeling conventions: wall types, level and grid strategy, view organization,
  worksharing habits.
- Building a project template or family library from scratch.

These are a specialist's work. Doing them while learning Revit would cost a2o more
than hiring someone who already knows it, and the first result would be redone.

## Two questions that size this

1. How many Revit seats?
2. What are the current workstations (age, RAM, graphics card)?

The answers decide whether the IT setup is an afternoon or includes a hardware purchase.

## What Keys2TheWeb needs to begin

1. a2o's current drafting standards and two or three typical past projects (DWG and PDF).
2. The go-ahead on Phase 0 and the $3,000 invoice.

Keys2TheWeb · Nick Grassi · nick@keys2theweb.com · Key Largo, FL
