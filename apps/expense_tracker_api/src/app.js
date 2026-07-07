import express from "express";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Error Handler
app.use(errorHandler);

export default app;