import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { hashPassword } from "../auth.js";
import { createUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";


export type UserResponse = Omit<NewUser, "hashPassword">
export async function handleCreateUser(req: Request, res: Response) {

    type Parameter = {
        password: string;
        email: string;
    }

    const { email, password } = req.body as Parameter

    if (!email || !password) {
        throw new BadRequestError("Missing required fields")
    }

    const hashedPassword = await hashPassword(password)

    const user = await createUser({
        email,
        hashPassword: hashedPassword
    } satisfies NewUser)

    if (!user) {
        throw new Error("Could not create User")
    }

    res.status(200).json({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    } satisfies UserResponse)

}