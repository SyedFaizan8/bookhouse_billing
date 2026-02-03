import { CorsOptions } from "cors"

export const corsOptions: CorsOptions = {
    origin: [
        "https://vbh.trivarta.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}
