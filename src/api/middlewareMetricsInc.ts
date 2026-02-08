import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export function middlewareMetricsInc (_: Request, res: Response, next: NextFunction){
    res.locals.fileServerHits = config.api.fileServerHits += 1
    console.log("middleware metrics ", res.locals.fileServerHits)
    next()
}