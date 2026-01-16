import express from "express"
import { middlewareLogResponses } from "./api/middlewareLog.js";
import { handlerReadiness } from "./api/handleReadiness.js"
import { middlewareMetricsInc } from "./api/middlewareMetricsInc.js";
import { getMetricsInc, resetMetricsInc } from "./api/handleMetrics.js";
import * as path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { config } from "./config.js";
import type { NextFunction, Request, Response } from "express";

const PORT = 8080
const app = express();

// Middleware to parse JSON bodies (e.g., data from an API client like Postman)
// app.use(express.json());

// Middleware to parse URL-encoded bodies (e.g., data from an HTML form)
// app.use(express.urlencoded({ extended: true }));

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(errorHandler);

app.get("/api/healthz", handlerReadiness);

app.get("/users", middlewareLogResponses);

app.get("/api/metrics", getMetricsInc);

app.get("/api/reset", resetMetricsInc);

// console.log("path.join", path.join("./src/app/"))
// console.log("__dirname", path.join( __dirname, "../src/app/", "admin.html"));
// console.log("__dirname /src/app", { root: path.join(__dirname, '../src/app/') });

app.get("/admin/metrics", (req, res) => {

    res.set({"Content-Type": "text/html; charset=utf-8"});
       res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${config.fileServerHits} times!</p>
                </body>
                </html>`
            )
});

app.post("/admin/reset", resetMetricsInc, (req, res) => {
    res.set({"Content-Type": "text/html; charset=utf-8"});
 
    res.sendFile(path.join(__dirname, "../src/app/", "admin.html"), (err) => {
        // console.log("admin/metrics" , path.join("admin.html", __dirname, '../src/app/'))
        if (err) {
            console.error(`Error in sendFile ${err}`)
        } else {
            console.log(`File sent successfully`);
        }
    })
})

app.post("/api/validate_chirp", (req:Request, res:Response, next: NextFunction) => {
    console.log("api/validate_chirp")
    let rawData:string = ""
    // ensure chucks are treated as strings
    req.setEncoding("utf-8");
    
    type responseData = {
        body: string;
    }

    const parsedBody:responseData = {
        body: ""
    }

    const profaneWords = ["kerfuffle", "sharbert", "fornax"]

    // listen for data events
    req.on("data", (chunk) => {
        console.log("chunk ", chunk)
        console.log("parsedBody" , parsedBody)
        rawData += chunk
        console.log("rawData " , rawData)

    })

    // listen for end events
    req.on("end", () => {
        try {
            // res.header("Content-Type", "application/json");
            // let body = JSON.parse(body)
            // console.log(body)
            // console.log(typeof body)
            const data = JSON.parse(rawData);
            console.log(" data ", data)
            parsedBody.body = data.body;
            // console.log("parsedBody" , parsedBody)
            // console.log("parsedBody" , parsedBody.body)
            // console.log("parsedBody.body.length" , parsedBody.body.length)
            if (parsedBody.body.length <= 140) {
                // res.status(200).json({valid: true})
                for (const word of profaneWords) {
                    
                    if (parsedBody.body.toLowerCase().includes(word.toLowerCase())) {
                        const regex = new RegExp(word, "i")
                        parsedBody.body = parsedBody.body.replace(regex, "****") 
                    }
                }
                res.status(200).json({cleanedBody: parsedBody.body})
            }
            else if (parsedBody.body.length > 140) {
                // res.status(400).json({error: "Chirp is too long"})
                throw new Error("Something went wrong on our end")
                
            }
            else {
                // res.status(400).json({"error": "Something went wrong"})
                throw new Error("Something went wrong on our end")
            }
            
        } catch(err) {
            // res.header("Content-Type", "application/json");
            console.log("error in catch ", err)
            // return res.status(400).send("invalid json ")
            next(err)
        }
    })

    // req.on("end", (err) => {
    //     console.error("request err ", err)
    //     return res.status(500).send("Error processing request");
    // })
})

/**.
app.post("/api/validate_chirp", (req, res) => {
    // console.log("req body", req.body)
    const { body } = req.body
    console.log("body ", body);

    if (body.length <= 140) {
        res.status(200).json({valid: true})
    } else if (body.length > 140) {
        res.status(400).json({error: "Chirp is too long"})
    } 
    else {
        console.log("length ", body.length)
        res.status(400).json({"error": "Something went wrong"})
    }
    
    // res.send("ok")
})
 */
function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log("Something went wrong on our end")
    res.status(500).json({
        error: "Something went wrong on our end"
    })
}

app.listen(8080, () => {
    console.log(`Server listening on Port ${PORT}`)
})

