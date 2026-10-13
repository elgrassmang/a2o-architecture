import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { placeholderExamples } from "./seed-data";

loadEnv({ path: ".env.local" });
loadEnv();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  let created = 0;
  let updated = 0;
  for (const ex of placeholderExamples) {
    const existing = await db.example.findUnique({ where: { id: ex.key } });
    const { key, ...data } = ex;
    await db.example.upsert({
      where: { id: key },
      create: { id: key, ...data, isPlaceholder: true },
      update: { ...data, isPlaceholder: true },
    });
    if (existing) updated++;
    else created++;
  }
  const byType = await db.example.groupBy({ by: ["type"], _count: { _all: true } });
  console.log(`Seeded placeholder examples: ${created} created, ${updated} updated.`);
  for (const row of byType) console.log(`  ${row.type}: ${row._count._all}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
