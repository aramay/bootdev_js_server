import express from "express"
import { middlewareLogResponses } from "./api/middlewareLog.js";
import { handlerReadiness } from "./api/handleReadiness.js"
import { middlewareMetricsInc } from "./api/middlewareMetricsInc.js";
import { getMetricsInc, resetMetricsInc } from "./api/handleMetrics.js";

const PORT = 8080
const app = express();

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));


app.get("/healthz", handlerReadiness);

app.get("/users", middlewareLogResponses);

app.get('/metrics', getMetricsInc);

app.get("/reset", resetMetricsInc);


app.listen(8080, () => {
    console.log(`Server listening on Port ${PORT}`)
})

