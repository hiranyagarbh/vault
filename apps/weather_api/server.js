import express from "express";
import "dotenv/config";
import rateLimiter from "./middleware/rateLimiter.js";
import requestLogger from "./middleware/requestLogger.js";
import weatherRoutes from "./routes/weather.js";

const app = express();

app.use(requestLogger);
app.use(rateLimiter);
app.set("json spaces", 4);
app.use("/api/weather", weatherRoutes);
app.use((_, res) => { res.status(404).json({ error: "404 - Not Found" }); });
app.use((err, _, res, next) => { console.error(err); res.status(500).json({ error: "500 - Internal Server Error" }); });

app.listen(process.env.PORT, () => { console.log(`Server started on port ${process.env.PORT}`); });