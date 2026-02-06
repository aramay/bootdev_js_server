import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps, NewUser, users, NewRefreshTokens, refresh_tokens } from "../schema.js";

export async function getUserFromRefreshToken(refreshToken: string) {
    const [result] = await db
        .select()
        .from(refresh_tokens)
        .where(eq(refresh_tokens.token, refreshToken))
    
    return result
}

export async function insertRefeshToken(token: NewRefreshTokens) {
    // console.log("teoken insertRefreshTOken ", token)
    const [result] = await db
        .insert(refresh_tokens)
        .values({
            userId: token.userId,
            token: token.token
        })
        // .onConflictDoNothing()
        .returning()

    return result;
}
export async function createUser(user: NewUser) {

    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    
    // const { hashPassword, ...userDataWithoutHashPassword } = result
    // return userDataWithoutHashPassword;
    return result

}

export async function createChirps(chirp: NewChirp) {
    console.log("chirp query ", chirp)
    const [result] = await db
        .insert(chirps)
        .values({
            body: chirp.body,
            userId: chirp.userId
        })
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

export async function getUserByEmail(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

    return result
}