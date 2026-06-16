import "./preload.js"; // to preload env variables
import { beforeEach, afterEach, describe, it } from "node:test";
import assert from "node:assert";
import { createClient } from "redis";
import { getCached, setCached, deleteCached, disconnect } from "../services/cacheService.js";


describe("database integration", () => {
    let testDbClient;
    const defaultTTL = Number(process.env.CACHE_TTL_SECONDS) || 43200;

    beforeEach(async () => {
        testDbClient = createClient({ url: process.env.REDIS_URL });
        // console.log(process.env.REDIS_URL);
        await testDbClient.connect();
    });

    afterEach(async () => {
        await testDbClient.quit();
    });

    it("checks if database is connected", async () => {
        assert.strictEqual(await testDbClient.ping(), "PONG");
    });

    it("check default TTL value", async () => {
        await setCached("testKey", "testValue");
        let ttl = await testDbClient.ttl("testKey");

        assert.ok(ttl >= defaultTTL - 100 && ttl <= defaultTTL + 100);
        await deleteCached("testKey");
    });
});

describe("caching module tests", () => {
    const testKey = "testKey";
    const testValue = { temperature: 25, humidity: 60 };


    // setting and retrieving cached data
    it("sets and retrieves cached data", async () => {
        await setCached(testKey, testValue);
        const cachedData = await getCached(testKey);
        assert.deepStrictEqual(cachedData, testValue);
    });

    // returning null for non-existent keys
    it("returns null for non-existent keys", async () => {
        const cachedData = await getCached("nonExistentKey");
        assert.strictEqual(cachedData, null);
    });

    // deleting cached data
    it("deletes cached data", async () => {
        await setCached(testKey, testValue);
        await deleteCached(testKey);
        const cachedData = await getCached(testKey);
        assert.strictEqual(cachedData, null);
    });
});

describe("disconnect function tests - must run after all other tests", { concurrency: true }, () => {
    it("checks if disconnect works", async () => {
        await disconnect();
        assert.strictEqual(await getCached("testKey"), null);
    })
});