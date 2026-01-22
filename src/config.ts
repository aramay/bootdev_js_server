process.loadEnvFile()

import type { MigrationConfig } from "drizzle-orm/migrator";

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./db/migrations",
}

function envOrThrow(url: string) {
    console.log(url)
    console.log(process.env[url])
    const value = process.env[url]
    if (!value) {
        throw new Error(`Environment variable ${value} is not set`)
    }
    return value
}

type DBConfig = {
    dbURL: string;
    migrationConfig: MigrationConfig
}

type APIConfig = {
    fileServerHits: number;
    port: Number;
    env: string;
};

type Config = {
    api: APIConfig;
    db: DBConfig;
}

export const config: Config = {
    api: {
        fileServerHits: 0,
        port: Number(envOrThrow("PORT")),
        env: envOrThrow("PLATFORM"),
    },
    db: {
        dbURL: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig
    }
}
