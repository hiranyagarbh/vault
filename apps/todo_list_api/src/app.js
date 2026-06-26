import express from "express";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use(authRoutes);
app.use(todoRoutes);

// Error Handler
app.use(errorHandler);

export default app;