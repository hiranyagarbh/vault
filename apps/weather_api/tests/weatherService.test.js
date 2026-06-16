import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { fetchWeather } from "../services/weatherService.js";

const originalFetch = globalThis.fetch;

beforeEach(() => {
    globalThis.fetch = async () => {
        return {
            ok: true,
            status: 200,
            json: async () => ({ currentConditions: { temp: "18.50", humidity: "89.00", conditions: "Partly cloudy", windspeed: "12.00" } })
        }
    }
})

afterEach(() => { globalThis.fetch = originalFetch; })

describe("fetchWeather", () => {
    let city = "Japan";

    describe("API URL construction", () => {
        it("should call correct API URL", async () => {
            process.env.WEATHER_API_BASE_URL = "https://test.api.com"
            process.env.WEATHER_API_KEY = "testkey"

            let calledUrl;
            globalThis.fetch = async (url) => {
                calledUrl = url;
                return {
                    ok: true
                    , status: 200
                    , json: async () => ({
                        currentConditions: {
                            temp: 1
                            , humidity: 1
                            , conditions: "x"
                            , windspeed: 1
                        }
                    })
                }
            }

            await fetchWeather(city);
            assert.ok(calledUrl.includes(`${process.env.WEATHER_API_BASE_URL}/${city}?`))
            assert.ok(calledUrl.includes(`key=${process.env.WEATHER_API_KEY}`))
            assert.ok(calledUrl.includes("unitGroup=metric"))
            assert.ok(calledUrl.includes("include=current"))
        })

        it("should pass city with spaces in URL", async () => {
            let calledUrl;
            globalThis.fetch = async (url) => {
                calledUrl = url;
                return {
                    ok: true, status: 200
                    , json: async () => ({
                        currentConditions: { temp: 1, humidity: 1, conditions: "x", windspeed: 1 }
                    })
                };
            };
            await fetchWeather("New York");
            assert.ok(calledUrl.includes("/New York?"));
        })

        it("should pass empty string city in URL", async () => {
            let calledUrl;
            globalThis.fetch = async (url) => {
                calledUrl = url;
                return {
                    ok: true, status: 200
                    , json: async () => ({
                        currentConditions: { temp: 1, humidity: 1, conditions: "x", windspeed: 1 }
                    })
                };
            };
            await fetchWeather("");
            assert.ok(calledUrl.includes("/?key="));
        })
    })

    describe("successful responses", () => {
        it("should fetch the data", async () => {
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.city, city);
            assert.strictEqual(weather.temperature, "18.50");
            assert.strictEqual(weather.humidity, "89.00");
            assert.strictEqual(weather.conditions, "Partly cloudy");
            assert.strictEqual(weather.wind_speed, "12.00");
        })

        it("should return only expected keys on success", async () => {
            const weather = await fetchWeather(city);
            const keys = Object.keys(weather).sort();
            assert.deepStrictEqual(keys, ["city", "conditions", "humidity", "temperature", "wind_speed"]);
        })

        it("should strip extra fields from API response", async () => {
            globalThis.fetch = async () => ({
                ok: true, status: 200
                , json: async () => ({
                    currentConditions: {
                        temp: 20, humidity: 50, conditions: "Clear", windspeed: 5
                        , visibility: 10, pressure: 1013, uvindex: 3
                    }
                })
            });
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.visibility, undefined);
            assert.strictEqual(weather.pressure, undefined);
            assert.strictEqual(weather.uvindex, undefined);
        })

        it("should pass through numeric values as-is", async () => {
            globalThis.fetch = async () => ({
                ok: true, status: 200
                , json: async () => ({
                    currentConditions: { temp: 0, humidity: 0, conditions: "", windspeed: 0 }
                })
            });
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.temperature, 0);
            assert.strictEqual(weather.humidity, 0);
            assert.strictEqual(weather.wind_speed, 0);
            assert.strictEqual(weather.conditions, "");
        })
    })

    describe("city not found errors", () => {
        [400, 404].forEach((status) => {
            it(`should return city not found for status ${status}`, async () => {
                globalThis.fetch = async () => ({ ok: false, status });
                const weather = await fetchWeather(city);
                assert.strictEqual(weather.error, "City not found");
                assert.strictEqual(weather.status, 404);
            })
        })
    })

    describe("service unavailable errors", () => {
        [401, 429, 502, 503].forEach((status) => {
            it(`should handle ${status} as service unavailable`, async () => {
                globalThis.fetch = async () => ({ ok: false, status });
                const weather = await fetchWeather(city);
                assert.strictEqual(weather.error, "Weather service is unavailable");
                assert.strictEqual(weather.status, 502);
            })
        })
    })

    describe("error handling", () => {
        it("should handle thrown errors as internal server error", async () => {
            globalThis.fetch = async () => { throw new Error("Server error"); }
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.error, "Internal server error");
            assert.strictEqual(weather.status, 500);
        })

        it("should handle network failure (TypeError)", async () => {
            globalThis.fetch = async () => { throw new TypeError("fetch failed"); }
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.error, "Internal server error");
            assert.strictEqual(weather.status, 500);
        })

        it("should handle malformed JSON response", async () => {
            globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("Unexpected token"); } });
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.error, "Internal server error");
            assert.strictEqual(weather.status, 500);
        })

        it("should handle missing currentConditions in response", async () => {
            globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
            const weather = await fetchWeather(city);
            assert.strictEqual(weather.error, "Internal server error");
            assert.strictEqual(weather.status, 500);
        })
    })
})