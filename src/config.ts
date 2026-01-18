process.loadEnvFile()

function envOrThrow(url: string) {
    const value = process.env[url]
    if (!value) {
        throw new Error(`Environment variable ${value} is not set`)
    }
    return value
}

type APIConfig = {
    fileServerHits: number;
    dbURL: string;
};

export const config: APIConfig = {
    fileServerHits: 0,
    dbURL: envOrThrow("DB_URL")
}
