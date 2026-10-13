export type SeedExample = {
  /** Stable id so re-seeding upserts instead of duplicating. */
  key: string;
  type: "GENERAL_NOTES" | "SPEC_SECTION" | "SCHEDULE";
  title: string;
  projectType: "residential" | "light_commercial" | "mixed_use";
  occupancy: string | null;
  jurisdiction: string | null;
  tags: string[];
  body: string;
};
