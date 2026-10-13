import { config as loadEnv } from "dotenv";
import { vi } from "vitest";

loadEnv({ path: ".env.local" });
loadEnv();

// Tests run against a real Postgres database, never a mock.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres@localhost:5432/a2o_draft_test";

// `server-only` throws outside a React Server Components bundle; neutralize it here.
vi.mock("server-only", () => ({}));
