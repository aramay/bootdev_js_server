import express from "express"
import { middlewareLogResponses } from "./api/middlewareLog.js";
import { handlerReadiness } from "./api/handleReadiness.js"
import { middlewareMetricsInc, resetMiddleWareInc } from "./api/middlewareMetricsInc.js";
import type { NextFunction, Request, Response } from "express";

const PORT = 8080
const app = express();

app.use(middlewareLogResponses, middlewareMetricsInc);
app.use("/app", express.static("./src/app"));


app.get("/healthz", handlerReadiness);

app.get("/users", middlewareLogResponses);

app.get('/metrics', (_: Request, res: Response) => {
    console.log(res.locals.hitsCount);
    // res.send("OK!")
     res.send(`Hits: ${res.locals.hitsCount}`)
})

app.get("/reset", (_: Request, res: Response, next: NextFunction) => {
    res.locals.hitsCount = 0
    // res.send("Ok")
    next()
}, resetMiddleWareInc)

// function handlerReadiness(_: Request, res: Response) {
//     console.log("health fucn called")
//     res.set({'Content-Type': 'text/plain; charset=utf8'})
//     return res.send("OK")
// }

// function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
//     console.log("middlewarelogging")
//     // res.send("hello users");
//     res.on("finish", () => {
//         console.log(res.statusCode)
//         console.log(res.statusMessage)
//         if (res.statusMessage === "Not Found") {
//             console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
//         }
//     })
//     next();
// }

app.listen(8080, () => {
    console.log(`Server listening on Port ${PORT}`)
})

