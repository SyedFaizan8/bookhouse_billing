import { CorsOptions } from "cors"
import { env } from "./env.js";

const allowedOrigins = [env.CLIENT_URL]

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // allow server-to-server or curl requests
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    ],
}
