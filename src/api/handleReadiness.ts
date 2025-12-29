import type { Request, Response } from "express";

export function handlerReadiness(_: Request, res: Response) {
    console.log("health fucn called")
    res.set({'Content-Type': 'text/plain; charset=utf8'})
    return res.send("OK")
}