import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { fetchWeather } from "../services/weatherService.js";

// save real fetch  and replace with mock
const originalFetch = globalThis.fetch;

beforeEach(() => {
    globalThis.fetch = async () => {
        return {
            ok: true,
            status: 200,
            json: async () => ({
                currentConditions: {
                    temp: "18.50"
                    , humidity: "89.00"
                    , conditions: "Partly cloudy"
                    , windspeed: "12.00"
                }
            })
        }
    }
})

afterEach(() => {
    globalThis.fetch = originalFetch;
})

describe("fetchWeather", () => {
    let city = "Japan";

    it("should check for city not found", async () => {
        globalThis.fetch = async () => {
            return {
                ok: false
                , status: 404
            }
        }
        const weather = await fetchWeather(city);
        assert.strictEqual(weather.error, "City not found");
    })

    it("should check for service failure", async () => {
        globalThis.fetch = async () => {
            return {
                ok: false
                , status: 502
            }
        }
        const weather = await fetchWeather(city);
        assert.strictEqual(weather.error, "Weather service is unavailable");
    })

    it("should check for server error", async () => {
        globalThis.fetch = async () => { throw new Error("Server error"); }
        const weather = await fetchWeather(city);
        assert.strictEqual(weather.error, "Internal server error");
    })

    it("should fetch the data", async () => {
        const weather = await fetchWeather(city);
        assert.strictEqual(weather.city, city);
        assert.strictEqual(weather.temperature, "18.50");
        assert.strictEqual(weather.humidity, "89.00");
        assert.strictEqual(weather.conditions, "Partly cloudy");
        assert.strictEqual(weather.wind_speed, "12.00");
    })
})