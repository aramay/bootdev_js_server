import { defineConfig } from "drizzle-kit";
export default defineConfig({
    schema: "src/db/schema.ts",
    out: "src/db",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://aramay:@localhost:5432/chirpy?sslmode=disable"
    },
});
