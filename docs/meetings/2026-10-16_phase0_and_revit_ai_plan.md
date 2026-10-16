# Phase 0, Revit, and AI: how the pieces fit

Prepared by Keys2TheWeb for a2o Architecture · October 16, 2026

## The short version

a2o is moving from AutoCAD LT to Revit. Phase 0 ($3,000) does the two things that
have to happen anyway, early and calmly: it takes the repetitive writing off the
drafters now, and it gets a2o's drafting standards written down so the Revit setup
starts from an answer instead of a question.

Once a2o is in Revit, most of the AI help the firm will want is either already built
into Revit or available free through an add-in that lets Claude work inside the model.
Keys2TheWeb's job is to supply what those tools cannot: a2o's own standards, voice,
and Keys-specific know-how, and to make the pieces work together. That is why the
plan buys the generic tools and builds only the a2o-specific layer.

## Phase 0: what the $3,000 covers

**1. The a2o Draft Assistant, already built.** A private web app that writes General
Notes, Specification Sections, and Schedules in a2o's voice. It works from a2o's own
past documents, not generic boilerplate. Type a short brief and the project facts,
get a draft, edit it, copy it onto the sheet. Save good ones and reuse them. The tool
exists today; the Phase 0 work is loading a2o's real documents and tuning it to the
firm's conventions, then sitting with a drafter on a live project until it earns its
place.

**2. a2o's drafting standards, one page per item.** Title block, layers and line
weights, block library, annotation, and note language, reviewed by a2o's lead drafter
and handed over as a2o's own document. This is the input every Revit template builder
asks for first.

**3. Overflow drafting help during the changeover**, as needed.

**What Phase 0 is not.** It does not build Revit templates or family libraries, which
the proposal keeps on a2o's track (in-house, a Revit specialist, or Autodesk
onboarding). It does not automate inside AutoCAD LT, which cannot be extended. It is
relief around LT, built so nothing is thrown away when Revit arrives.

## Where Claude and NonicaTab fit once Revit is in place

**NonicaTab** is a free Revit add-in from Nonica (Autodesk Marketplace, Revit 2020
through 2027). Its "AI Connector" lets Claude, on the desktop or in Claude Code,
work directly on the open Revit model through about fifty predefined actions.
According to Nonica's listing, those cover:

- Reading and checking the model: parameters on any element, which views sit on which
  sheets, element counts, missing data.
- Selecting and editing in bulk: renumbering, renaming, filling in parameters across
  many elements at once.
- Documentation setup: creating sheets and sections, placing views on sheets, bulk
  duplicating and renaming views and sheets.

It does not draw. Nothing in the listing creates walls or places doors; it manages
and documents a model that people draw. Exact capabilities should be confirmed in
Claude's tool list after installing, before anyone relies on them.

**What that means in practice for a2o:**

- *Template and sheet-set assembly gets cheaper.* The tedious half of a Revit template
  (sheet lists, view structure, naming, standard parameters) can be driven by Claude
  from a2o's standards document, while a person makes the judgment calls. That is
  work Keys2TheWeb would otherwise have scripted by hand.
- *The Draft Assistant's output has a path into Revit.* Schedules and notes generated
  by the app can be applied to the model and sheets, rather than retyped.
- *Everyday chores stop costing drafter time.* "Renumber the doors on level 2." "Find
  every room with no finish assigned." "Duplicate the sheet set for the addition."

**Revit itself is adding AI.** Autodesk's 2027 release includes an assistant inside
Revit for sheet and schedule management, element operations, automated documentation,
and drawing-compliance checks. a2o should start on the newest Revit it can get.

**Sketch-to-model tools** such as Civly exist and sell for roughly A$2,000 per seat
per month, with code checks for Australian, US IBC, and EU codes but nothing for the
Florida Building Code, flood and wind provisions, or HARC. Worth a look later; not
something to build.

## Why this saves money over time

**Buy the generic, build only the specific.** General-purpose Revit AI is being built
by Autodesk and offered free by add-ins like NonicaTab. Paying anyone to recreate it
would be money spent on something a2o will get anyway. Keys2TheWeb's work stays on
what no vendor can supply: a2o's voice, a2o's standards, Keys and HARC specifics, and
the glue between tools.

**The standards pay three times.** Written once in Phase 0, they feed the Draft
Assistant now, the Revit template in Phase 1, and any conversion of a2o's own DWGs
into Revit later. Without them, each of those is a separate discovery exercise.

**Drafter hours, in a2o's own numbers.** The honest way to size the return is to
fill in the firm's figures:

| Input | a2o's number |
|---|---|
| Hours per project now spent writing or copy-editing notes, specs, and schedules | ____ |
| Hours per project after the Draft Assistant (typically a fraction) | ____ |
| Projects per year | ____ |
| Loaded hourly cost of a drafter | ____ |

Two to three hours saved per project, across a normal year of projects, repays Phase 0
several times over before the Revit template work begins. Fewer stale copy-paste
errors are a bonus that does not show in the arithmetic.

**Every step is optional.** a2o can stop after Phase 0 with the tool, the standards,
and the changeover support in hand. Phase 1 (standards into the Revit templates,
rollout coordination, $1,500 to $2,500) and Phase 2 (a real-project assessment of what
Revit and the free tools still leave undone, $2,500) are priced from evidence, not
guesses, and each is a separate decision.

## What Keys2TheWeb needs to begin

1. a2o's current drafting standards and two or three typical past projects (DWG and PDF).
2. The go-ahead on Phase 0 and the $3,000 invoice.

Keys2TheWeb · Nick Grassi · nick@keys2theweb.com · Key Largo, FL
