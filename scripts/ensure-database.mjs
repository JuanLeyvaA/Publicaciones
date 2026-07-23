import fs from "node:fs/promises";
import path from "node:path";

const databasePath = path.resolve("prisma/dev.db");
await fs.mkdir(path.dirname(databasePath), { recursive: true });
await fs.appendFile(databasePath, "");
