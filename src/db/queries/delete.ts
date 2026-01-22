import { db } from "../index.js"
import { users } from "../schema.js"

export async function deleteUser() {
    const [result] = await db.delete(users)
    return result
}