// import { argon2d } from "argon2";
import * as argon2 from "argon2"
// const argon2 = require("argon2")
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
        if (await argon2.verify(hash, passwd)) {
            return true;
        } 
        else {
            console.log("Password did not match")
            return false;
        }
    } catch(err) {
        throw new Error("verifying password failed")
    }
}