import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI doesn't read Next.js's .env.local automatically, so load it here.
config({ path: ".env.local", quiet: true });
config({ quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
