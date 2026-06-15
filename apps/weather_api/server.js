import express from "express";
import "dotenv/config";
import { getCached, setCached } from "./services/cacheService.js";
import rateLimiter from "./middleware/rateLimiter.js";
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

    try {
        const response = await fetch(`${process.env.WEATHER_API_BASE_URL}/${city}?key=${process.env.WEATHER_API_KEY}&unitGroup=metric&include=current`);
        if (response.status === 400) { return res.status(404).json({ error: "404 - city not found" }); }
        else if (!response.ok) { return res.status(500).json({ error: "Weather service is unavailable" }); }

        const data = await response.json();
        const weather = {
            city: city,
            temperature: data.currentConditions.temp,
            humidity: data.currentConditions.humidity,
            conditions: data.currentConditions.conditions,
            wind_speed: data.currentConditions.windspeed,
            cached: false
        };

        await setCached(cachedKey, weather);
        res.json(weather);
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(process.env.PORT, () => { console.log(`Server started on port ${process.env.PORT}`); });