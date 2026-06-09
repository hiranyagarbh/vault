import { createSession, deleteSession, verifySession, isAuthenticated } from "../auth.js";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";

describe("Auth Tests", () => {
    before(() => {
        deleteSession();
    })
    after(() => {
        deleteSession();
    })
    test("Should create a session", () => {
        const session = createSession();
        assert.strictEqual(typeof session, "string", "Should return a string");
    })
    test("Should verify a session", () => {
        const session = createSession();
        assert.strictEqual(verifySession(session), true, "Should return true");
        deleteSession();
    })
    test("Should delete a session", () => {
        const session = createSession();
        deleteSession();
        assert.strictEqual(verifySession(session), false, "Should return false");
    })
    test("Should check authentication", () => {
        const session = createSession();
        const req = { headers: { cookie: `sessionToken=${session}` } };
        assert.strictEqual(isAuthenticated(req), true, "Should return true");
    })
    test("Should check authentication without cookie header", () => {
        const req = { headers: {} };
        assert.strictEqual(isAuthenticated(req), false, "Should return false");
    })
    test("Should check authentication with wrong session", () => {
        const req = { headers: { cookie: `sessionToken=random` } };
        assert.strictEqual(isAuthenticated(req), false, "Should return false");
    })
    test("Should check authentication with empty session value", () => {
        const req = { headers: { cookie: `sessionToken=` } };
        assert.strictEqual(isAuthenticated(req), false, "Should return false");
    })
})