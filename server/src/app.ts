import express from "express";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { corsOptions } from "./cors.config.js";
import path from "path";
import { createInitialAdmin } from "./bootstrap/createAdmin.js";
import { notFoundMiddleware } from "./middlewares/notfound.middleware.js";

const app = express();

app.set("trust proxy", 1);

(async () => await createInitialAdmin())()

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);

// health check
app.use("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Backend is running"
    })
});

app.use(notFoundMiddleware)
app.use(errorMiddleware);

export default app;
