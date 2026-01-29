import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
- iss is the issuer of the token. Set this to chirpy
- sub is the subject of the token, which is the user's ID.
- iat is the time the token was issued. Use Math.floor(Date.now() / 1000) to get the current time in seconds.
- exp is the time the token expires. Use iat + expiresIn to set the expiration
 */

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;

    const customPayload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: exp
    }

    const token = jwt.sign(customPayload, secret);
    return token;
}


export function validateJWT(tokenString: string, secret: string ): string {
    try {
        const result = jwt.verify(tokenString, secret, { issuer: "chirpy"}) as JwtPayload
        console.log("sub ", result)
        if (result.sub) {
            return result.sub
        }
    } catch(err) {
        console.log("token verification failed ", (err as Error).message)
    }
    return ""
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