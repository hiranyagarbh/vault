import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import rateLimiter, { MAX_REQUESTS, resetRequestLog } from "../src/middleware/rateLimiter.js";

function createMockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; }
    };
    return res;
}

describe("rateLimiter", () => {
    beforeEach(() => {
        resetRequestLog();
    });

    it("should call next() when under limit", () => {
        const req = { ip: "1.1.1.1" };
        const res = createMockRes();
        let nextCalled = false;
        const next = () => { nextCalled = true; };

        rateLimiter(req, res, next);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(res.statusCode, null);
    });

    it("should return 429 when limit exceeded", () => {
        const req = { ip: "2.2.2.2" };
        const res = createMockRes();
        let nextCount = 0;
        const next = () => { nextCount++; };

        for (let i = 0; i < MAX_REQUESTS; i++) { rateLimiter(req, createMockRes(), next); }

        rateLimiter(req, res, next);

        assert.strictEqual(res.statusCode, 429);
        assert.strictEqual(nextCount, MAX_REQUESTS);
    });

    it("should track IPs independently", () => {
        const req1 = { ip: "3.3.3.1" };
        const req2 = { ip: "3.3.3.2" };
        const res = createMockRes();
        let nextCount = 0;
        const next = () => { nextCount++; };

        for (let i = 0; i < MAX_REQUESTS; i++) { rateLimiter(req1, createMockRes(), next); }

        rateLimiter(req2, res, next);

        assert.strictEqual(res.statusCode, null);
        assert.strictEqual(nextCount, MAX_REQUESTS + 1);
    });

    it("should reset between tests via resetRequestLog", () => {
        const req = { ip: "4.4.4.4" };
        const res = createMockRes();
        let nextCalled = false;
        const next = () => { nextCalled = true; };

        rateLimiter(req, res, next);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(res.statusCode, null);
    });

    it("should include error message in 429 response", () => {
        const req = { ip: "5.5.5.5" };
        const next = () => { };

        for (let i = 0; i < MAX_REQUESTS; i++) {
            rateLimiter(req, createMockRes(), next);
        }

        const res = createMockRes();
        rateLimiter(req, res, next);

        assert.strictEqual(res.statusCode, 429);
        assert.strictEqual(res.body.error, "Too many requests");
        assert.strictEqual(res.body.message, "Please try again later");
    });
});
