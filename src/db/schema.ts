import { InferInsertModel } from "drizzle-orm";
import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", {length: 256 }).unique().notNull(),
    hashPassword: varchar("hash_password").notNull().default("unset")
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