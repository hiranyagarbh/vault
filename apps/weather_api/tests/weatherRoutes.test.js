import "./preload.js";
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import express from "express";
import router from "../routes/weather.js";
import { getCached, deleteCached, disconnect } from "../services/cacheService.js";

const originalFetch = globalThis.fetch;
const originalLog = console.log; // stubbed to avoid logging in tests
const city = "delhi";

beforeEach(() => {
    console.log = () => { };
    globalThis.fetch = async (url) => {
        if (url.includes("localhost")) return originalFetch(url);
        return {
            ok: true,
            status: 200,
            json: async () => ({ currentConditions: { temp: "18.50", humidity: "89.00", conditions: "Partly cloudy", windspeed: "12.00" } })
        }
    }
})

afterEach(async () => {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
    await deleteCached(city);
})

describe("router integration tests", () => {
    let app, server, baseUrl;

    before(() => {
        app = express();
        app.use("/", router);

        server = app.listen(0);
        baseUrl = `http://localhost:${server.address().port}`;
    })

    after(async () => {
        server.close();
        await disconnect();
    })

    describe("validation", () => {
        it("should return 400 for missing city parameter", async () => {
            const res = await fetch(`${baseUrl}/`);
            const data = await res.json();

            assert.strictEqual(res.status, 400);
            assert.strictEqual(data.error, "400 - Missing or invalid city parameter");
        })
    })

    describe("successful responses", () => {
        it("should fetch weather data for a city", async () => {
            const res = await fetch(`${baseUrl}/?city=${city}`);
            const data = await res.json();

            assert.strictEqual(res.status, 200);
            assert.strictEqual(data.city, city);
            assert.strictEqual(data.cached, false);
            assert.ok(data.temperature);
            assert.ok(data.conditions);
            assert.ok(data.humidity);
            assert.ok(data.wind_speed);
        })
    })

    describe("caching behavior", () => {
        it("should return cached data for the same city", async () => {
            await fetch(`${baseUrl}/?city=${city}`);
            const res = await fetch(`${baseUrl}/?city=${city}`);
            const data = await res.json();

            assert.strictEqual(res.status, 200);
            assert.strictEqual(data.city, city);
            assert.strictEqual(data.cached, true);
        })

        it("should normalize cache keys by trimming and lowercasing", async () => {
            await deleteCached("delhi");

            const res1 = await fetch(`${baseUrl}/?city=%20%20dElHi%20%20`);
            const data1 = await res1.json();
            assert.strictEqual(res1.status, 200);
            assert.strictEqual(data1.cached, false);

            const cached = await getCached("delhi");
            assert.ok(cached);

            const res2 = await fetch(`${baseUrl}/?city=%20%20dElHi%20%20`);
            const data2 = await res2.json();
            assert.strictEqual(res2.status, 200);
            assert.strictEqual(data2.cached, true);
        })
    })

    describe("error handling", () => {
        it("should propagate errors from the weather service", async () => {
            globalThis.fetch = async (url) => {
                if (url.includes("localhost")) return originalFetch(url);
                return {
                    ok: false,
                    status: 404
                };
            };

            const res = await fetch(`${baseUrl}/?city=nonexistent`);
            const data = await res.json();

            assert.strictEqual(res.status, 404);
            assert.strictEqual(data.error, "City not found");
        })
    })
});