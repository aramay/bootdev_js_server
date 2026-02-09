import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors.js";
import type { Request } from "express";
import { randomBytes } from "node:crypto";

export function getAPIKey(req: Request): string {
    
    const authHeader = req.get("Authorization")
    let PolkaAPIKey: string = ""

    if (authHeader) {
        console.log("Polka auth header ", authHeader.split(" ").slice(1).join())
        return PolkaAPIKey = authHeader.split(" ").slice(1).join()

    } else {
        throw new UserNotAuthenticatedError("Cannot find Polka API key")
    }
}

export function makeRefreshToken(): string {
    // const buffer = 0;
    // this is synchronous code
    const buffer = randomBytes(256)
    return buffer.toString("hex");
    /*
    let token: string = ''
    randomBytes(256, (err: Error | null, buffer: Buffer) => {
        if (err) throw err;
        console.error(err)
        console.log(`Async random data ${buffer.toString("hex")}`)
        token = buffer.toString("hex")
        // return;
    })
    return token;
    */
}


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function getBearerToken (req: Request): string {
    let authHeader = req.get("Authorization")
    let authToken: string  = ""
    console.log("getBearerToken \n")
    console.log(" req.body ", req.body)
    
    if (authHeader) {
        console.log("auth bearer found => ", authHeader.split(" ").slice(1).join() )
        return authToken = authHeader.split(" ").slice(1).join()
    } else {
        throw new UserNotAuthenticatedError("Cannot find Authorization header")
    }

    /*const userID = validateJWT(authToken, config.api.JWTSecret)

    if (userID) {
        req.body.userID = userID
        next()
    } else {
        throw new Error("Could not validate user")
    }*/
    
   
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;
    const iss = "chirpy";

    const customPayload: payload = {
        iss: iss,
        sub: userID,
        iat: iat,
        exp: exp
    }

    const token = jwt.sign(customPayload, secret);
    return token;
}

/**
- iss is the issuer of the token. Set this to chirpy
- sub is the subject of the token, which is the user's ID.
- iat is the time the token was issued. Use Math.floor(Date.now() / 1000) to get the current time in seconds.
- exp is the time the token expires. Use iat + expiresIn to set the expiration
 */
export function validateJWT(tokenString: string, secret: string ): string {
    try {
        const result = jwt.verify(tokenString, secret, { issuer: "chirpy"}) as JwtPayload
        console.log("sub ", result)
        // return userId
        if (!result.sub) {
            throw new UserNotAuthenticatedError("Not authorized")
        }
        return result.sub;
        // return new UserNotAuthenticatedError("Malformed token")
    } catch(err) {
        console.log("token verification failed ", (err as Error).message)
        throw new UserNotAuthenticatedError("Not authorized")
    }
};


export async function hashPassword(passwd: string) {

    try {
        const hash = await argon2.hash(passwd)
        return hash
    } catch (err) {
        console.log("something went wrong hashing password")
        throw new Error("Hashing password failed")
    }
}


export async function checkPasswordHash(hash: string, passwd: string) {

    try {
        return (await argon2.verify(hash, passwd)) ? true : false

        // if (await argon2.verify(hash, passwd)) {
        //     return true;
        // } 
        // else {
        //     console.log("Password did not match")
        //     return false;
        // }
    } catch(err) {
        throw new Error("verifying password failed")
    }
}

/*
export async function makeJWT(userID: string, expiresIn: any, secret: string): Promise<string> {

    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + expiresIn

    const customPayload: payload = { 
        sub: userID,
        iss: "chirpy",
        iat: iat,
        exp: exp
    }

    // const options: SignOptions = {
    //     expiresIn: expiresIn
    // }
    
    return new Promise((resolve, reject) => {
        jwt.sign(
        customPayload,
        secret as Secret,
        (err, token) => {
            if (err) return reject(err);
            if (!token) return reject (new Error("token generation failed"));

            resolve(token)
        })
    }); 
}
*/