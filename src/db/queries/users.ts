import { db } from "../index.js";
import { NewChirp, chirps, NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;

}

export async function createChirps(chirp: NewChirp) {
    console.log("chirp query ", chirp)
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();

    return result;
}