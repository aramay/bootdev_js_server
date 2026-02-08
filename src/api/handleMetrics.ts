import type { Request, Response } from "express";
import { config } from "../config.js";

export function getMetricsInc (_: Request, res: Response) {
    console.log(config)

    res.send({Hits: config.api.fileServerHits});
}

export function resetMetricsInc(_:Request, res: Response){
    config.api.fileServerHits = 0;
    res.send("ok");
}