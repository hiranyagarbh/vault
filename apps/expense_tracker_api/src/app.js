import cookieParser from "cookie-parser";
import express from "express";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(errorHandler);

export default app;