import express from "express";
import "dotenv/config";
import rateLimiter from "./middleware/rateLimiter.js";
import { getCached, setCached } from "./services/cacheService.js";
import { fetchWeather } from "./services/weatherService.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

app.use(requestLogger);
app.use(rateLimiter);

app.get("/api/weather", async (req, res) => {
    console.log(`Processing request for city: ${req.query.city}`);
    const city = req.query.city;
    if (!city) { return res.status(400).json({ error: "400 - Missing or invalid city parameter" }); }

    const cachedKey = city.trim().toLowerCase();
    const cachedData = await getCached(cachedKey);

    if (cachedData) { return res.json({ ...cachedData, cached: true }); }

    const weather = await fetchWeather(city);
    if (weather.error) { return res.status(weather.status).json({ error: weather.error }); }

    await setCached(cachedKey, weather);
    res.json(weather);
});


app.listen(process.env.PORT, () => { console.log(`Server started on port ${process.env.PORT}`); });