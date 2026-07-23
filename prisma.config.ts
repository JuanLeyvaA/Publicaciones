import { defineConfig } from "prisma/config";
import path from "node:path";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? `file:${path.resolve("prisma/dev.db")}`,
  },
});
