import express from "express";
import { createClient } from "redis"
import "dotenv/config"

const app = express();
const redisClient = createClient({ url: process.env.REDIS_URL })
redisClient.on("error", (err) => console.log("Redis Client Error", err))

await redisClient.connect()

app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({
            error: "400 - Missing or invalid city parameter"
        })
    }

    const cachedKey = city.trim().toLowerCase();
    const cachedData = await redisClient.get(cachedKey);

    if (cachedData) {
        return res.json({
            ...JSON.parse(cachedData),
            cached: true
        });
    }

    // Visualcrossing URL format
    // {BASE_URL}/{city}?key={API_KEY}&unitGroup=metric&include=current
    try {
        const response = await fetch(`${process.env.WEATHER_API_BASE_URL}/${city}?key=${process.env.WEATHER_API_KEY}&unitGroup=metric&include=current`)
        if (response.status === 400) {
            return res.status(404).json({ error: "404 - city not found" });
        } else if (!response.ok) {
            return res.status(500).json({ error: "Weather service is unavailable" });
        }
        const data = await response.json();
        const weather = {
            city: city,
            temperature: data.currentConditions.temp,
            humidity: data.currentConditions.humidity,
            conditions: data.currentConditions.conditions,
            wind_speed: data.currentConditions.windspeed,
            cached: false
        };
        await redisClient.set(cachedKey, JSON.stringify(weather), { EX: Number(process.env.CACHE_TTL_SECONDS) || 60 * 60 * 12 })
        res.json(weather);
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})


app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
    console.log(`Open browser and go to http://localhost:${process.env.PORT}/api/weather?city=London`);
});