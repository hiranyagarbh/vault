import express from "express";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app;