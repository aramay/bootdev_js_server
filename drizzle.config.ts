
import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: config.db.dbURL
    },
});

