import express from "express"
import { middlewareLogResponses } from "./api/middleware.js";
import { handlerReadiness } from "./api/handleReadiness.js"
import { middlewareMetricsInc } from "./api/middlewareMetricsInc.js";
import { getMetricsInc, resetMetricsInc } from "./api/handleMetrics.js";
import * as path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { config } from "./config.js";
import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./api/errors.js";

import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.dbURL , { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

import { createChirps, createUser, getChirpByID, getChirps, getUserByEmail, getUserFromRefreshToken, insertRefeshToken, revokeToken, updateUser } from "./db/queries/users.js";
import { deleteUser } from "./db/queries/delete.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth.js";
import { NewUser, refresh_tokens } from "./db/schema.js";
import { handleCreateUser } from "./api/users.js";
import { converStringToMS, getDate } from "./utils.js";


const PORT = 8080
const app = express();

// Middleware to parse JSON bodies (e.g., data from an API client like Postman)
app.use(express.json());

// Middleware to parse URL-encoded bodies (e.g., data from an HTML form)
app.use(express.urlencoded({ extended: true }));

app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));


app.get("/api/healthz", handlerReadiness);

app.get("/users", middlewareLogResponses);

app.get("/api/metrics", getMetricsInc);

app.get("/api/reset", resetMetricsInc);

// console.log("path.join", path.join("./src/app/"))
// console.log("__dirname", path.join( __dirname, "../src/app/", "admin.html"));
// console.log("__dirname /src/app", { root: path.join(__dirname, '../src/app/') });

app.get("/api/chirps/:chirpID", async (req: Request, res: Response, next: NextFunction) => {
    type Parameters = {
        chirpID: string;
    }
    
    let { chirpID } = req.params as Parameters
    console.log("chirpID ", chirpID)
    try {
        let chirpByID = await getChirpByID(chirpID)
        
        if (!chirpByID) {
            // res.status(404).send("not ok")
            return next(new NotFoundError(`Error - Could find chirp with ID - ${chirpByID}`))
        }
        res.status(200).json(chirpByID)
    } catch(err) {
        console.log("Error getting a chirps - /api/chirp/:chirdID")
        next(err)
    }
})

app.get("/admin/metrics", (req, res) => {
    
    res.set({"Content-Type": "text/html; charset=utf-8"});
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
                </body>
                </html>`
    )
});


app.post("/admin/reset", async (req, res, next) => {
    if (config.api.env !== "dev") {
        // extremely dangerous endpoint can only be accessed in a local development environment.
        res.status(403).send("Forbidden")
    } 
    else {
        try {
            await deleteUser()
            res.set(200).send("OK")
        } catch (err) {
            console.log("Something went wrong in deleteUser")
            next(err)
        }
    }
})
/*
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
*/

app.get("/api/chirps", async (_: Request, res: Response, next: NextFunction) => {
    
    try {
        const chirps = await getChirps();
        res.status(200).json(chirps)
    } catch(err) {
        console.log("Error getting chirps - /api/chirps")
        next(err)
    }
})

app.post("/api/chirps", async (req:Request, res:Response, next:NextFunction) => {
    try {
        type reqData = {
            body: string;
            userId: string
        }
        
        const authToken = getBearerToken(req)
        
        let params: reqData = req.body
        
        let userID = validateJWT(authToken, config.api.JWTSecret)
        
        if (userID) {
            params.userId = userID
        }
        
        console.log("params ", params)
        
        if (!params.body || !params.userId) {
            return next(new BadRequestError("Chirp body missing"))
        }
        
        
        const chirp = await createChirps({ body: params.body, userId: params.userId })
        console.log("chirps ", chirp)
        
        return res.status(201).json(chirp)
    } catch(err) {
        console.log("Something went wrong on our end - /api/chirps")
        res.status(401).end();
        // next(err)
    }
})

app.post("/api/users", handleCreateUser)



app.post("/api/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        type Parameters = {
            email: string,
            password: string,
            expiresInSeconds: number
        }
        
        console.log(req.body)
        converStringToMS("1 h")
        
        const { email, password, expiresInSeconds = converStringToMS("1 h")} = req.body as Parameters
        
        let user = await getUserByEmail(email)
        
        console.log("user ", user)
        
        const verified = await checkPasswordHash(user.hashPassword, password)
        
        if (!user || !verified) {
            return res.status(401).send("Incorrect email or password")
        }
        
        const token = makeJWT(user.id, expiresInSeconds, config.api.JWTSecret) 
        // 256-bit hex string
        const refreshToken = makeRefreshToken()
        console.log("refresh_token ", refreshToken)
        
        // save to DB: token, user_id, expires_at (+60 days)
        getDate()
        await insertRefeshToken({
            token: refreshToken,
            userId: user.id
            // this is why it was not updating date field
            // big mistake
            // expires_at: new Date() 
        })
        
        res.status(200).json({
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email: user.email,
            token: token,
            refreshToken: refreshToken
        })
    } catch (err) {
        console.error("Login Error ", err)
        return res.status(500).json({error: "Internal server error"})
    }
    
})

app.post("/api/refresh", async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        
        // getDate()
        const now = new Date()
        const refreshToken = getBearerToken(req)
        
        let row = await getUserFromRefreshToken(refreshToken)
        
        console.log(" user from refresh token \n", row);
        //if it doesn't exist, or if it's expired or revoked, respond with a 401 status code. // Otherwise, respond with a 200 code and this shape:
        
        if (
            !row ||
            !row.expires_at ||
            row.expires_at <= now || 
            row.revoked_at
        ) {
            res.status(401).end();
            
        } else {
            const newAccessToken = makeJWT(row.userId, converStringToMS("1 h"), config.api.JWTSecret)
            res.status(200).json({token: newAccessToken})
        }
        
        // res.send("ok")
    } catch(err) {
        console.log("Failed to get refreshTokens")
        next(err)
    }
    
})

app.post("/api/revoke", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = getBearerToken(req)

        // revoke token
        
        let isRevoked = await revokeToken({
            token: refreshToken, 
            revoked_at: new Date()
        })

        console.log("revoked " , isRevoked)
        /**this does not work, cuz we don't have userId */
        // const isRevoked = await revokeToken({
        //     token: refreshToken,
        //     revoked_at: new Date()
        // })

        // res.status(204).send("ok")
        res.status(204).end();
    } catch (err) {
        console.log("Revoke token API failed")
        next(err)
    }
    
})

app.put("/api/users", async (req: Request, res: Response, next: NextFunction) => {
    try {

        type reqData = {
            email: string;
            password: string;
        }

        const { email, password } = req.body as reqData;

        if (!email || !password) {
            throw new BadRequestError("Email or password missing")
        }

        // get access token from header
        const accessToken = getBearerToken(req)

        // res 401 if it is missing
        if (!accessToken) {
            return res.status(401).end()
        }

        const user = validateJWT(accessToken, config.api.JWTSecret)

        console.log("user in PUT ", user)
        if (!user) {
            return res.status(401).end()
            
        } 
        const hashedPassword = await hashPassword(password)
        
        const updatedUser = await updateUser({
            id: user,
            email,
            hashedPassword: hashedPassword
        })
        console.log("updatedUser ", updatedUser)
        return res.status(200).json(updatedUser)
        

    } catch (err) {
        console.log("Unable to update User")
        if (err instanceof UserNotAuthenticatedError) {
            return res.status(401).end()
        } else {
            console.log("type error ", typeof err)
            return res.status(500).end();
        }
    }
    
})

function errorHandler(
    err: Error,
    _: Request,
    res: Response,
    __: NextFunction
) {
    if (err instanceof BadRequestError) {
        console.log("BadRequestError \n")
        res.status(400).json({error: err.message})
    }
    console.log("An unexpected error occured \n")
    if (!res.headersSent) {
        console.log("Error - !res.headersSent ", err.message)
        return res.status(500).json({ 
            error: "An unexpected server error occurred." 
        });
    }
    console.log("Error ", err.message)
    res.status(500).json({error: "An unexpected error occured"})
}
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server listening on Port ${PORT}`)
})

/*

app.post("/api/users", async (req, res, next) => {
type parameter = {
email: string;
password: string;
}

let hashedPasswd = ""

const { email, password } = req.body as parameter

if (!email || !password) {
throw new BadRequestError("Missing required field - email or password")
}

try {
hashedPasswd = await hashPassword(password)
} catch (err) {
console.log("Something went wrong while hashing the password")
next(err)
}

try {
const user = await createUser({email, hashPassword: hashedPasswd})
// type tempUser = Omit<typeof user, "hashPassword">
console.log("results ", user)
res.status(201).json(user)
} catch(err) {
console.log("Error creating user ")
next(err)

}
})
*/

/*
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
})
*/