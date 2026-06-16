import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import rateLimiter, { MAX_REQUESTS } from "../middleware/rateLimiter.js";

let testId = 0;
function uniqueIp() { return `10.0.${Math.floor(testId / 256)}.${testId % 256}`; }

function mockReq(ip) { return { ip }; }
function mockRes() {
    return {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(obj) { this.body = obj; return this; },
    };
}

describe("rateLimiter", () => {
    let ip, nextCalled, next;

    beforeEach(() => {
        testId++;
        ip = uniqueIp();
        nextCalled = false;
        next = () => { nextCalled = true; };
    });

    it("calls next() for first request", () => {
        rateLimiter(mockReq(ip), mockRes(), next);
        assert.strictEqual(nextCalled, true);
    });

    it("calls next() for requests within limit", () => {
        const res = mockRes();
        for (let i = 0; i < 5; i++) {
            nextCalled = false;
            rateLimiter(mockReq(ip), res, next);
            assert.strictEqual(nextCalled, true, `request ${i + 1} should pass`);
        }
    });

    it("allows exactly MAX_REQUESTS requests, blocks the next", () => {
        const res = mockRes();
        for (let i = 0; i < MAX_REQUESTS; i++) {
            nextCalled = false;
            rateLimiter(mockReq(ip), res, next);
            assert.strictEqual(nextCalled, true, `request ${i + 1} should pass`);
        }
        nextCalled = false;
        rateLimiter(mockReq(ip), res, next);
        assert.strictEqual(nextCalled, false, "request past limit should be blocked");
        assert.strictEqual(res.statusCode, 429);
    });

    // blocks requests

    it("returns 429 when limit exceeded", () => {
        const res = mockRes();
        for (let i = 0; i < MAX_REQUESTS; i++) {
            rateLimiter(mockReq(ip), res, next);
        }
        nextCalled = false;
        rateLimiter(mockReq(ip), res, next);
        assert.strictEqual(res.statusCode, 429);
        assert.strictEqual(nextCalled, false, "next should NOT be called on 429");
    });

    it("returns correct error body on 429", () => {
        const res = mockRes();
        for (let i = 0; i < MAX_REQUESTS; i++) {
            rateLimiter(mockReq(ip), res, next);
        }
        rateLimiter(mockReq(ip), res, next);
        assert.deepStrictEqual(res.body, {
            error: "Too many requests",
            message: "Please try again later",
        });
    });

    it("keeps blocking after first 429", () => {
        const res = mockRes();
        for (let i = 0; i < MAX_REQUESTS; i++) {
            rateLimiter(mockReq(ip), res, next);
        }
        // requests past limit
        for (let i = 0; i < 3; i++) {
            nextCalled = false;
            rateLimiter(mockReq(ip), res, next);
            assert.strictEqual(res.statusCode, 429, `extra request ${i + 1} should still be 429`);
            assert.strictEqual(nextCalled, false);
        }
    });

    it("tracks IPs independently", () => {
        const ip2 = uniqueIp() + "x"; // different IP
        const res = mockRes();

        // exhaust limit for ip
        for (let i = 0; i < MAX_REQUESTS; i++) {
            rateLimiter(mockReq(ip), res, next);
        }

        // ip2 should still be allowed
        nextCalled = false;
        rateLimiter(mockReq(ip2), res, next);
        assert.strictEqual(nextCalled, true, "different IP should not be affected");
    });

    it("does not modify the request object", () => {
        const req = mockReq(ip);
        const originalKeys = Object.keys(req);
        rateLimiter(req, mockRes(), next);
        assert.deepStrictEqual(Object.keys(req), originalKeys);
    });
});