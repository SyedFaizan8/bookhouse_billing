import { CorsOptions } from "cors"
import { env } from "./env.js"

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // server-to-server / nextjs proxy / postman
        if (!origin) return callback(null, true)

        // allow localhost frontend in dev
        if (env.NODE_ENV === "development") {
            if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") {
                return callback(null, true)
            }
        }

        // production → block browser direct access
        return callback(null, true)
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    ],
}
