import express from "express";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";
import errorHandler from "./middleware/errorHandler.js";
import { initializeDatabase } from "./db/index.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/posts", postRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    await initializeDatabase();
    console.log(`Server running on port ${port}`);
});

export default app;