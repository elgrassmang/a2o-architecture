import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js loads .env.local itself; the Prisma CLI does not, so load it here.
loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
