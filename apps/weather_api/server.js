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

    const weather = {
        "city": city,
        "temperature": 25,
        "humidity": 72,
        "conditions": "Sunny",
        "wind_speed": 12.3,
        "cached": false
    }
    await redisClient.set(cachedKey, JSON.stringify(weather), { EX: Number(process.env.CACHE_TTL_SECONDS) })

    res.json(weather);
})

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
    console.log(`Open browser and go to http://localhost:${process.env.PORT}/api/weather?city=London`);
});