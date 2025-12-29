import type { Request, Response, NextFunction } from "express";
import {APIConfig} from "../config.js";
import { hasUncaughtExceptionCaptureCallback } from "node:process";

let hitsCount: APIConfig = { fileServerHits: 0}

export function middlewareMetricsInc (req: Request, res: Response, next: NextFunction){

    
    if (req.path === "/metrics") { 
        console.log("req.path - metrics middleware ", req.path === "/metrics")
        res.locals.hitsCount = hitsCount.fileServerHits
        next()
    } else {
 console.log("metrics called")
    res.locals.hitsCount = hitsCount.fileServerHits += 1
    // res.locals.hitsCount.fileServerHits += 1
    // console.log(hitsCount)
    // res.locals.hitsCount = hitsCount.fileServerHits += 1;
    // console.log(res.locals.hitsCount)
    // res.locals.hitsCount = temp.toString()
    console.log("metrics middleware ", hitsCount)
    next();
    }
   
}

export function resetMiddleWareInc (_: Request, res: Response) {
    hitsCount.fileServerHits = 0
    console.log("resetMiddleWareInc")
    console.log(hitsCount);
    res.send("OK")
}