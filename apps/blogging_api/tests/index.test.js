import "./setup.js";
import { describe, it } from "node:test";
import assert from "node:assert";
import pool, { closeDatabase, initializeDatabase } from "../db/index.js";

describe("db/index.js unit tests", () => {

    it("should create a connection pool", () => {
        assert.notStrictEqual(pool, null);
    });

    it("should connect to the database", async () => {
        await initializeDatabase();
        const result = await pool.query("SELECT NOW()");
        assert.notStrictEqual(result, null);
    });

    it("should log error when query fails", async () => {
        const originalQuery = pool.query;
        pool.query = () => Promise.reject(new Error("Mock error"));
        
        try {
            await initializeDatabase();
            assert.fail("Should have thrown an error");
        } catch (error) {
            assert.strictEqual(error.message, "Mock error");
        } finally {
            pool.query = originalQuery;
        }
    });

    it("should gracefully shut down", async () => {
        await closeDatabase();
        assert.strictEqual(pool.totalCount, 0);
        assert.strictEqual(pool.idleCount, 0);
    });

});

