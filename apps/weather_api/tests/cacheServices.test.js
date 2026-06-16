import { config } from "dotenv";
config({ path: ".env.test" });

import { describe, it } from "node:test";
import assert from "node:assert";
import { getCached, setCached, deleteCached } from "../services/cacheService.js";

describe("caching module tests", () => {
    const testKey = "testKey";
    const testValue = JSON.stringify({ temperature: 25, humidity: 60 });

    it("sets and retrieves cached data", async () => {
        await setCached(testKey, testValue);
        const cachedData = await getCached(testKey);
        assert.strictEqual(cachedData, testValue);
    });

    it("returns null for non-existent keys", async () => {
        const cachedData = await getCached("nonExistentKey");
        assert.strictEqual(cachedData, null);
    });

    it("deletes cached data", async () => {
        await setCached(testKey, testValue);
        await deleteCached(testKey);
        const cachedData = await getCached(testKey);
        assert.strictEqual(cachedData, null);
    });
});