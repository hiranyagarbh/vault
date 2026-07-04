import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import authenticate from "../src/middleware/auth.js";

const SECRET = "test-secret";

function createMockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; }
    };
    return res;
}

describe("authenticate middleware", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = SECRET;
    });

    it("should set req.user and call next for valid token", () => {
        const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: "1h" });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        let nextCalled = false;

        authenticate(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(req.user.id, 1);
    });

    it("should return 401 for missing authorization header", () => {
        const req = { headers: {} };
        const res = createMockRes();
        let nextCalled = false;

        authenticate(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(res.statusCode, 401);
    });

    it("should return 401 for invalid token", () => {
        const req = { headers: { authorization: "Bearer invalid.token.here" } };
        const res = createMockRes();
        let nextCalled = false;

        authenticate(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(res.statusCode, 401);
    });

    it("should return 401 for expired token", () => {
        const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: "0s" });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        let nextCalled = false;

        // Small delay to ensure expiry
        setTimeout(() => {
            authenticate(req, res, () => { nextCalled = true; });
            assert.strictEqual(nextCalled, false);
            assert.strictEqual(res.statusCode, 401);
        }, 10);
    });

    it("should return 401 for wrong secret", () => {
        const token = jwt.sign({ id: 1 }, "wrong-secret", { expiresIn: "1h" });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = createMockRes();
        let nextCalled = false;

        authenticate(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(res.statusCode, 401);
    });
});
