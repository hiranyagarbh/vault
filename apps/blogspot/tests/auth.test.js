import { createSession, deleteSession, verifySession, isAuthenticated, protectedRoutes } from "../auth.js";
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";

describe("createSession", () => {
    beforeEach(() => deleteSession());

    test("returns a string", () => {
        const token = createSession();
        assert.strictEqual(typeof token, "string");
    });

    test("returns valid UUID format", () => {
        const token = createSession();
        // RFC 4122 version 4 UUID regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        assert.match(token, uuidRegex, "should be a valid v4 UUID");
    });

    test("each call returns different token", () => {
        const t1 = createSession();
        const t2 = createSession();
        assert.notStrictEqual(t1, t2);
    });

    test("new session invalidates previous session", () => {
        const old = createSession();
        createSession();
        assert.strictEqual(verifySession(old), false, "old token should no longer verify");
    });
});

describe("verifySession", () => {
    beforeEach(() => deleteSession());

    test("returns true for current token", () => {
        const token = createSession();
        assert.strictEqual(verifySession(token), true);
    });

    test("returns false for wrong token", () => {
        createSession();
        assert.strictEqual(verifySession("not-a-real-token"), false);
    });

    test("returns false when no session exists", () => {
        assert.strictEqual(verifySession("anything"), false);
    });

    test("returns false for null", () => {
        createSession();
        assert.strictEqual(verifySession(null), false);
    });

    test("returns false for undefined", () => {
        createSession();
        assert.strictEqual(verifySession(undefined), false);
    });
});

describe("deleteSession", () => {
    beforeEach(() => deleteSession());

    test("invalidates active session", () => {
        const token = createSession();
        deleteSession();
        assert.strictEqual(verifySession(token), false);
    });

    test("safe to call when no session exists", () => {
        assert.doesNotThrow(() => deleteSession());
    });

    test("safe to call multiple times", () => {
        createSession();
        deleteSession();
        assert.doesNotThrow(() => deleteSession());
    });
});

describe("isAuthenticated", () => {
    beforeEach(() => deleteSession());

    test("returns true with valid session cookie", () => {
        const token = createSession();
        const req = { headers: { cookie: `sessionToken=${token}` } };
        assert.strictEqual(isAuthenticated(req), true);
    });

    test("returns false with no cookie header", () => {
        createSession();
        const req = { headers: {} };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("returns false with wrong token value", () => {
        createSession();
        const req = { headers: { cookie: "sessionToken=wrong-value" } };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("returns false with empty token value", () => {
        createSession();
        const req = { headers: { cookie: "sessionToken=" } };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("returns false when no session exists (even with cookie)", () => {
        // no createSession() called
        const req = { headers: { cookie: "sessionToken=some-token" } };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("returns false after session deleted", () => {
        const token = createSession();
        deleteSession();
        const req = { headers: { cookie: `sessionToken=${token}` } };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("works with multiple cookies present", () => {
        const token = createSession();
        const req = { headers: { cookie: `other=abc; sessionToken=${token}; theme=dark` } };
        assert.strictEqual(isAuthenticated(req), true);
    });

    test("ignores other cookie names", () => {
        createSession();
        const req = { headers: { cookie: "otherCookie=some-value" } };
        assert.strictEqual(isAuthenticated(req), false);
    });

    test("returns false after session replaced", () => {
        const oldToken = createSession();
        createSession(); // new session replaces old
        const req = { headers: { cookie: `sessionToken=${oldToken}` } };
        assert.strictEqual(isAuthenticated(req), false);
    });
});

describe("protectedRoutes", () => {
    test("is an array", () => {
        assert.ok(Array.isArray(protectedRoutes));
    });
});