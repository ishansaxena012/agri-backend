import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js"; 
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { checkHealth } from "./modules/health/health.controller.js";

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: env.CORS_ORIGIN, 
  credentials: true
}));

app.use(express.json({ limit: "16kb" })); 
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));


app.get("/health", checkHealth);
app.use("/api/v1", routes); 

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorMiddleware);
export default app;