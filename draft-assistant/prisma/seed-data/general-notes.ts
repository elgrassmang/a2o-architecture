import type { SeedExample } from "./types";

/**
 * PLACEHOLDER general notes shaped like Florida Keys residential / light-commercial
 * practice. They exist so the grounding pipeline has something to select and the
 * model has a format to imitate. Replace with a2o's real sheets (see README).
 */
export const generalNotes: SeedExample[] = [
  {
    key: "gn-placeholder-elevated-sfr",
    type: "GENERAL_NOTES",
    title: "PLACEHOLDER - Elevated single-family residence, new construction",
    projectType: "residential",
    occupancy: "R-3",
    jurisdiction: "City of Key West",
    tags: ["elevated", "pile", "flood", "new-construction", "single-family", "impact"],
    body: `GENERAL
1.1 These notes apply to all sheets unless noted otherwise. Where a conflict exists between notes, drawings, and specifications, the more stringent requirement governs. Contractor shall notify Architect before proceeding.
1.2 Contractor shall verify all dimensions and existing conditions in the field prior to ordering materials or beginning work. Do not scale drawings.
1.3 Contractor is responsible for means, methods, sequencing, and jobsite safety.
1.4 All work shall be performed by licensed contractors in accordance with the permit and the approved construction documents. Permit set shall remain on site.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Residential, current adopted edition, and all amendments adopted by the City of Key West and Monroe County.
2.2 Structural design is based on the wind speed, exposure category, and risk category shown on the structural sheets. Contractor shall verify all exterior openings and cladding carry a current Florida Product Approval or Miami-Dade NOA for the design pressures indicated.
2.3 Flood-resistant construction shall comply with the Monroe County and City of Key West floodplain management ordinances and the FEMA flood zone and base flood elevation shown on the site plan.

SITE
3.1 Contractor shall locate and protect all existing utilities prior to excavation. Call 811 before digging.
3.2 Finished grade shall slope away from the structure a minimum of 6 inches in the first 10 feet unless otherwise shown.
3.3 Protect existing trees designated to remain. No storage of materials or equipment within the drip line.

STRUCTURAL
4.1 Refer to structural sheets for foundation, pile, and framing requirements. Structural notes govern over architectural notes for structural work.
4.2 All connectors and fasteners exposed to weather shall be hot-dip galvanized or stainless steel. Contractor shall verify compatibility with pressure-treated lumber.
4.3 Enclosed areas below the base flood elevation shall be used only for parking, access, and storage, with flood vents as shown.

EXTERIOR ENVELOPE
5.1 Install a continuous secondary water barrier at the roof deck per the roofing manufacturer and the adopted code. Contractor shall verify underlayment product approval.
5.2 All exterior penetrations shall be flashed and sealed. Provide sealant compatible with adjacent materials.
5.3 Exterior wood trim shall be back-primed prior to installation.

DOORS AND WINDOWS
6.1 All exterior doors and windows shall be impact-rated and carry a current Florida Product Approval for the design pressures shown. Submit product approvals and installation instructions prior to ordering.
6.2 Install per manufacturer's instructions and the approved product approval. Contractor shall verify rough openings in the field.

FINISHES
7.1 Submit samples of all exposed finishes for Architect's review prior to ordering.
7.2 Interior gypsum board at wet areas shall be moisture-resistant. Provide cement backer board at all tile locations.`,
  },
  {
    key: "gn-placeholder-historic-reno",
    type: "GENERAL_NOTES",
    title: "PLACEHOLDER - Historic district renovation and rear addition",
    projectType: "residential",
    occupancy: "R-3",
    jurisdiction: "City of Key West",
    tags: ["historic", "harc", "renovation", "addition", "existing", "dade-county-pine", "wood-frame"],
    body: `GENERAL
1.1 These notes apply to all sheets unless noted otherwise. The more stringent requirement governs where notes, drawings, and specifications conflict.
1.2 Contractor shall verify all existing conditions and dimensions in the field before fabrication or ordering. Report discrepancies to Architect prior to proceeding.
1.3 The existing structure is a contributing structure within the Key West Historic District. All exterior work shall match the approved HARC Certificate of Appropriateness. No deviation from the approved exterior materials, profiles, or colors without Architect and HARC approval.
1.4 Contractor shall protect existing historic fabric designated to remain. Salvage and store for reuse all original materials noted on the demolition plan.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Existing Building, current adopted edition, and the Florida Building Code, Residential, as applicable, with local amendments.
2.2 Work shall comply with the City of Key West Historic Architectural Review Commission guidelines as approved for this project.
2.3 Contractor shall verify flood zone, base flood elevation, and substantial improvement determination with the Building Department prior to commencing work.

DEMOLITION
3.1 Demolish only the items indicated. Shore and brace existing construction as required to maintain structural stability during the work.
3.2 Salvage existing Dade County pine framing, flooring, and siding where indicated for reuse. Stack and protect from weather.
3.3 Contractor shall verify the presence of lead paint and asbestos-containing materials and comply with all applicable regulations for handling and disposal.

STRUCTURAL
4.1 Refer to structural sheets. Where new framing connects to existing, Contractor shall expose and verify existing member sizes and condition and notify Architect of deterioration before proceeding.
4.2 New wood framing in contact with masonry or concrete shall be pressure treated. All exterior connectors shall be hot-dip galvanized or stainless steel.

EXTERIOR ENVELOPE
5.1 New siding, trim, and corner boards shall match existing profiles and exposures as approved by HARC. Submit samples prior to ordering.
5.2 Existing wood windows designated to remain shall be repaired in place. Replacement sash, where approved, shall match the existing in profile, muntin pattern, and glazing configuration.
5.3 Roofing shall be as approved by HARC. Install a continuous secondary water barrier at new roof decks.

DOORS AND WINDOWS
6.1 New exterior doors and windows at the addition shall be impact-rated with a current Florida Product Approval for the design pressures shown.
6.2 Contractor shall verify all openings in existing walls in the field prior to ordering.

FINISHES
7.1 Match new interior trim profiles to existing where new meets existing. Provide samples for Architect's review.
7.2 Refinish existing wood floors designated to remain. Patch with salvaged material where indicated.`,
  },
  {
    key: "gn-placeholder-storefront-ti",
    type: "GENERAL_NOTES",
    title: "PLACEHOLDER - Light-commercial tenant improvement, storefront retail",
    projectType: "light_commercial",
    occupancy: "M",
    jurisdiction: "City of Key West",
    tags: ["commercial", "tenant-improvement", "retail", "storefront", "accessibility", "mercantile", "interior"],
    body: `GENERAL
1.1 These notes apply to all sheets unless noted otherwise. The more stringent requirement governs where notes, drawings, and specifications conflict.
1.2 Contractor shall verify all existing conditions, dimensions, and utility locations in the field prior to beginning work. Report discrepancies to Architect before proceeding.
1.3 Work shall be coordinated with the Landlord and adjacent tenants. Maintain egress from adjacent spaces at all times during construction.
1.4 Contractor shall keep the premises secure and weather-tight at the end of each work day.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Building, and the Florida Building Code, Existing Building, current adopted editions, with amendments adopted by the City of Key West.
2.2 Accessibility shall comply with the Florida Building Code, Accessibility, current adopted edition. Contractor shall verify clearances, reach ranges, and mounting heights as shown.
2.3 Fire protection, fire alarm, and life-safety work shall be designed and installed by licensed contractors under separate permit. Coordinate with the Fire Marshal.

DEMOLITION
3.1 Remove existing finishes, partitions, and fixtures as indicated. Cap and make safe all abandoned utilities.
3.2 Contractor shall verify that no structural element is removed or altered without written direction from Architect.

INTERIOR CONSTRUCTION
4.1 Interior partitions shall be as scheduled. Extend partitions to the underside of structure where indicated as full-height or rated.
4.2 Provide blocking in walls for all wall-mounted fixtures, casework, grab bars, and equipment whether or not shown.
4.3 Seal all penetrations through rated assemblies with listed firestopping systems.

STOREFRONT
5.1 Storefront glazing and doors shall be impact-rated with a current Florida Product Approval for the design pressures shown. Submit shop drawings and product approvals prior to fabrication.
5.2 Contractor shall verify existing storefront opening dimensions in the field.

FINISHES
6.1 Submit samples of all exposed finishes for Architect's review prior to ordering.
6.2 Floor finishes at accessible routes shall be firm, stable, and slip resistant. Transitions shall not exceed the thresholds permitted by the accessibility code.
6.3 Provide moisture-resistant gypsum board at all wet areas and cement backer board behind tile.`,
  },
  {
    key: "gn-placeholder-pool-cabana",
    type: "GENERAL_NOTES",
    title: "PLACEHOLDER - Pool, cabana, and site improvements at existing residence",
    projectType: "residential",
    occupancy: "R-3",
    jurisdiction: "Monroe County",
    tags: ["pool", "cabana", "site", "accessory", "outdoor", "unincorporated", "county"],
    body: `GENERAL
1.1 These notes apply to all sheets unless noted otherwise. The more stringent requirement governs where notes, drawings, and specifications conflict.
1.2 Contractor shall verify all dimensions, setbacks, and existing conditions in the field prior to construction. Report discrepancies to Architect before proceeding.
1.3 Contractor shall maintain the existing residence weather-tight and occupied throughout construction. Coordinate utility interruptions with Owner 48 hours in advance.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Residential, current adopted edition, with amendments adopted by Monroe County.
2.2 Swimming pool construction, barriers, and equipment shall comply with the residential swimming pool provisions of the adopted code. Pool contractor shall provide engineered pool drawings under separate permit.
2.3 Contractor shall verify flood zone and base flood elevation for all new construction with the Monroe County Building Department.

SITE
3.1 Contractor shall locate and protect existing utilities, septic components, and drainage structures prior to excavation.
3.2 Stormwater shall be retained on site. Do not direct roof or deck drainage toward adjacent properties.
3.3 Protect existing native vegetation designated to remain. Removal of protected species requires County approval.

STRUCTURAL
4.1 Refer to structural sheets for cabana foundation and framing. All exterior connectors and fasteners shall be hot-dip galvanized or stainless steel.
4.2 Cabana roof framing and sheathing shall be installed per the structural sheets with connectors as scheduled.

EXTERIOR ENVELOPE
5.1 Cabana roofing shall match the existing residence in material and color. Install a continuous secondary water barrier at the roof deck.
5.2 Exterior wood shall be back-primed and all cut ends sealed prior to installation.

FINISHES
6.1 Pool deck finish shall be slip resistant. Submit samples for Architect's and Owner's review.
6.2 Outdoor shower and cabana bath finishes shall be rated for exterior and wet exposure.`,
  },
];
