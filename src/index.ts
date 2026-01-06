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
const PORT = 8080
const app = express();

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));


app.get("/api/healthz", handlerReadiness);

app.get("/users", middlewareLogResponses);

app.get('/api/metrics', getMetricsInc);

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

app.get("/admin/reset", resetMetricsInc, (req, res) => {
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

app.listen(8080, () => {
    console.log(`Server listening on Port ${PORT}`)
})

