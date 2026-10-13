import { generalNotes } from "./general-notes";
import { schedules } from "./schedules";
import { specSections } from "./spec-sections";
import type { SeedExample } from "./types";

export const placeholderExamples: SeedExample[] = [...generalNotes, ...specSections, ...schedules];
export type { SeedExample };
