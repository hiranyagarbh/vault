import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import rateLimiter, { MAX_REQUESTS } from "../middleware/rateLimiter.js";

// mock request and response objects
const reqAllow = { ip: "1.2.3.4" }
const reqBlock = { ip: "5.6.7.8" }
const res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; }
};
let nextCalled = false;

// reset nextCalled before each test
beforeEach(() => { nextCalled = false; });

// mock next() funct
const next = () => { nextCalled = true; };

describe("rateLimiter", () => {
    it("should allow requests if within rate limit", () => {
        rateLimiter(reqAllow, res, next);
        assert.strictEqual(nextCalled, true);
    });

    it("should block requests if over rate limit", () => {
        for (let i = 0; i < MAX_REQUESTS; i++) rateLimiter(reqBlock, res, next);
        rateLimiter(reqBlock, res, next);
        assert.strictEqual(res.statusCode, 429);
    });
});