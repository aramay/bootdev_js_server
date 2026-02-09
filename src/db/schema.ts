import { sql } from "drizzle-orm";
import { pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", {length: 256 }).unique().notNull(),
    hashPassword: varchar("hash_password").notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").default(false)
})

export type NewUser = typeof users.$inferInsert;

// export type safeUser = Omit<NewUser, "hashPassword">

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    //body.length > 140
    // !body
    body: varchar("body", {length: 140}).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
})

export type NewChirp = typeof chirps.$inferInsert;

export const refresh_tokens = pgTable("refresh_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    expires_at: timestamp("expires_at").default(sql`CURRENT_DATE + interval '60 days'`),
    // expires_at: timestamp("expires_at").notNull(),
    revoked_at: timestamp("revoked_at"),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
})

export type NewRefreshTokens = typeof refresh_tokens.$inferInsert;