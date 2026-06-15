import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

let isConnected = false;

redisClient.on("error", (err) => console.error("[Redis] Connection error:", err.message));
redisClient.on("connect", () => { isConnected = true; console.log("[Redis] Connected"); });
redisClient.on("end", () => { isConnected = false; console.warn("[Redis] Disconnected"); });
redisClient.on("reconnecting", () => console.log("[Redis] Reconnecting..."));

try {
    await redisClient.connect();
} catch (err) {
    console.error("[Redis] Initial connection failed:", err.message);
    console.warn("[Redis] Server will operate without cache until Redis is available");
}

const DEFAULT_TTL = 60 * 60 * 12; // 12 hours

export async function getCached(key) {
    if (!isConnected) return null;
    try {
        const rawData = await redisClient.get(key);
        if (rawData === null) return null;
        return JSON.parse(rawData);
    } catch (err) {
        console.error(`[Redis] GET failed for key "${key}":`, err.message);
        return null;
    }
}

export async function setCached(key, data, ttl) {
    if (!isConnected) return;
    const expiry = ttl ?? (Number(process.env.CACHE_TTL_SECONDS) || DEFAULT_TTL);

    try {
        await redisClient.set(key, JSON.stringify(data), { EX: expiry });
    } catch (err) {
        console.error(`[Redis] SET failed for key "${key}":`, err.message);
    }
}

export async function deleteCached(key) {
    if (!isConnected) return;

    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`[Redis] DEL failed for key "${key}":`, err.message);
    }
}

export async function disconnect() {
    if (isConnected) {
        await redisClient.quit();
        console.log("[Redis] Connection closed gracefully");
    }
}