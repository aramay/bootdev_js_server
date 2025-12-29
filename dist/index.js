import express from "express";
const PORT = 8080;
const app = express();
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);
app.get("/healthz", handlerReadiness);
app.get("/users", middlewareLogResponses);
function handlerReadiness(_, res) {
    console.log("health fucn called");
    res.set({ 'Content-Type': 'text/plain; charset=utf8' });
    return res.send("OK");
}
function middlewareLogResponses(req, res, next) {
    console.log("middlewarelogging");
    // res.send("hello users");
    res.on("finish", () => {
        console.log(res.statusCode);
        console.log(res.statusMessage);
        if (res.statusMessage === "Not Found") {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}
app.listen(8080, () => {
    console.log(`Server listening on Port ${PORT}`);
});
