import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "./errors.js";

async function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    })
    next();
}

function errorHandler(
    err: Error,
    _: Request,
    res: Response,
    __: NextFunction
) {
    console.log("Something went wrong on our end")
    if (err instanceof BadRequestError) {
        // res.header("Content-Type", "application/json");
        console.log("BadRequestError \n")
        res.status(400).json({error: err.message})
    }
    // res.status(500).json({
    //     error: err.message
    // })
}

export { middlewareLogResponses, errorHandler }
// export { middlewareLogResponses }