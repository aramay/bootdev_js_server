import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps, NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {

    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    
    const { hashPassword, ...userDataWithoutHashPassword } = result
    return userDataWithoutHashPassword;

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

export async function getChirps() {
    const results = await db
        .query.chirps.findMany()

    return results
}

export async function getChirpByID(chirdID: string) {
    
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirdID))

        console.log("result ", result)
    return result;
}

export async function lookupUserByEmail(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

    return result
}