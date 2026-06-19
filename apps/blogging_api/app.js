import express from "express";
import postRoutes from "./routes/posts.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app;