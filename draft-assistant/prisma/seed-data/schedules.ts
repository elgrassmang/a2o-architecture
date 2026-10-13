import type { SeedExample } from "./types";

/** PLACEHOLDER schedules in pipe-delimited text columns. Replace with a2o's real schedules. */
export const schedules: SeedExample[] = [
  {
    key: "sched-placeholder-door",
    type: "SCHEDULE",
    title: "PLACEHOLDER - Door schedule, elevated residence",
    projectType: "residential",
    occupancy: "R-3",
    jurisdiction: "City of Key West",
    tags: ["door", "doors", "hardware", "impact", "exterior", "interior"],
    body: `DOOR SCHEDULE
MARK | LOCATION | TYPE | SIZE (W x H) | MATERIAL | GLAZING | HARDWARE SET | RATING | REMARKS
D01 | Front entry | Single swing | 3'-0" x 8'-0" | Fiberglass, impact | Laminated impact | HW-1 | -- | Florida Product Approval required
D02 | Rear porch | French pair | 6'-0" x 8'-0" | Aluminum, impact | Laminated impact | HW-2 | -- | Florida Product Approval required
D03 | Garage to stair | Single swing | 2'-8" x 6'-8" | Solid-core wood | -- | HW-3 | 20 min | Self-closing, weatherstripped
D04 | Primary bedroom | Single swing | 2'-8" x 6'-8" | Solid-core wood | -- | HW-4 | -- | --
D05 | Primary bath | Pocket | 2'-6" x 6'-8" | Solid-core wood | -- | HW-5 | -- | Privacy set
D06 | Bedroom 2 | Single swing | 2'-8" x 6'-8" | Solid-core wood | -- | HW-4 | -- | --
D07 | Laundry | Bi-fold pair | 4'-0" x 6'-8" | Hollow-core wood | -- | HW-6 | -- | Louvered
D08 | Ground-level storage | Single swing | 3'-0" x 6'-8" | Fiberglass, impact | -- | HW-7 | -- | Below BFE; flood-resistant materials

NOTES
1. Contractor shall verify all rough openings in the field prior to ordering.
2. Submit product data, hardware schedule, and Florida Product Approvals for all exterior doors prior to ordering.
3. Exterior doors shall be impact-rated for the design pressures shown on the structural drawings.
4. Hardware sets are defined in the hardware schedule. Finish: as selected by Architect.
5. Doors below the base flood elevation shall be flood-damage-resistant materials.`,
  },
  {
    key: "sched-placeholder-window",
    type: "SCHEDULE",
    title: "PLACEHOLDER - Window schedule, historic renovation",
    projectType: "residential",
    occupancy: "R-3",
    jurisdiction: "City of Key West",
    tags: ["window", "windows", "historic", "harc", "impact", "glazing", "wood"],
    body: `WINDOW SCHEDULE
MARK | LOCATION | TYPE | SIZE (W x H) | FRAME | GLAZING | MUNTINS | EXISTING / NEW | REMARKS
W01 | Front facade | Double-hung | 2'-8" x 5'-6" | Wood, painted | Single, restoration glass | 2 over 2, true divided | Existing, repair | Repair in place per HARC approval
W02 | Front facade | Double-hung | 2'-8" x 5'-6" | Wood, painted | Single, restoration glass | 2 over 2, true divided | Existing, repair | Repair in place per HARC approval
W03 | Side, kitchen | Double-hung | 2'-8" x 4'-6" | Wood, impact | Laminated impact | 2 over 2, simulated divided | New | Match existing profile; Florida Product Approval required
W04 | Rear addition | Double-hung | 2'-8" x 5'-0" | Aluminum-clad wood, impact | Laminated impact | 2 over 2, simulated divided | New | Florida Product Approval required
W05 | Rear addition | Fixed | 3'-0" x 5'-0" | Aluminum-clad wood, impact | Laminated impact | -- | New | Florida Product Approval required
W06 | Bath | Awning | 2'-0" x 2'-0" | Aluminum-clad wood, impact | Laminated impact, obscure | -- | New | Tempered where required by code

NOTES
1. Contractor shall verify all existing and rough openings in the field prior to ordering.
2. New exterior windows shall match the approved HARC Certificate of Appropriateness in profile, muntin pattern, and finish. Submit shop drawings for Architect's and HARC review.
3. New windows shall be impact-rated with a current Florida Product Approval for the design pressures shown.
4. Existing windows designated for repair shall be reglazed, weatherstripped, and made operable. Replace deteriorated sash members in kind.
5. Safety glazing where required by code; Contractor shall verify locations.`,
  },
  {
    key: "sched-placeholder-finish",
    type: "SCHEDULE",
    title: "PLACEHOLDER - Room finish schedule, retail tenant improvement",
    projectType: "light_commercial",
    occupancy: "M",
    jurisdiction: "City of Key West",
    tags: ["finish", "finishes", "flooring", "ceiling", "paint", "commercial", "retail", "interior"],
    body: `ROOM FINISH SCHEDULE
ROOM NO. | ROOM NAME | FLOOR | BASE | WALLS | CEILING | CEILING HT | REMARKS
101 | Sales floor | Porcelain tile, PT-1 | Tile, PT-1 | Painted gypsum board, P-1 | Exposed structure, painted P-3 | VERIFY | Slip-resistant tile at accessible route
102 | Fitting rooms | Luxury vinyl plank, LVP-1 | Wood, painted P-2 | Painted gypsum board, P-1 | Gypsum board, painted P-3 | 9'-0" | Blocking for hooks and bench
103 | Stock room | Sealed concrete, SC-1 | Rubber, RB-1 | Painted gypsum board, P-1 | Exposed structure, painted P-3 | VERIFY | --
104 | Office | Carpet tile, CPT-1 | Rubber, RB-1 | Painted gypsum board, P-1 | Acoustic ceiling tile, ACT-1 | 9'-0" | --
105 | Toilet room | Porcelain tile, PT-2 | Tile, PT-2 | Tile wainscot PT-3 to 4'-0", painted MR gypsum board P-1 above | Gypsum board, painted P-3 | 8'-0" | Accessible fixtures and grab bars per drawings
106 | Janitor | Sealed concrete, SC-1 | Rubber, RB-1 | Painted MR gypsum board, P-1 | Gypsum board, painted P-3 | 8'-0" | FRP wainscot at mop sink

NOTES
1. Finish designations refer to the finish legend. Submit samples of all finishes for Architect's review prior to ordering.
2. Contractor shall verify ceiling heights in the field where noted VERIFY.
3. Floor finishes at accessible routes shall be firm, stable, and slip resistant.
4. Provide moisture-resistant gypsum board and cement backer board at all wet areas.
5. Paint: one coat primer and two finish coats minimum. Colors as selected by Architect.`,
  },
];
