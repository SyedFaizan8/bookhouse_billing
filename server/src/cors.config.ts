import { CorsOptions } from "cors"

const allowedOrigins = [
    "http://localhost:3001",          // Next.js dev
    "http://127.0.0.1:3001",
    "https://yourdomain.com",         // production
]

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
