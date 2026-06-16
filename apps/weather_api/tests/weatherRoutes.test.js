import "./preload.js";
import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import express from "express";
import router from "../routes/weather.js";
import { getCached, deleteCached, disconnect } from "../services/cacheService.js";

const originalFetch = globalThis.fetch;
const city = "delhi";

beforeEach(() => {
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

    after(() => {
        server.close();
    })

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

    it("should return cached data for the same city", async () => {
        await fetch(`${baseUrl}/?city=${city}`);
        const res = await fetch(`${baseUrl}/?city=${city}`);
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.city, city);
        assert.strictEqual(data.cached, true);
    })
});

describe("disconnect function tests", () => {
    it("should disconnect from the database", async () => {
        await disconnect();
        assert.strictEqual(await getCached(city), null);
    })
});