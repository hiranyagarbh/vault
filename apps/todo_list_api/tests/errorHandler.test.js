import { describe, it } from "node:test";
import assert from "node:assert";
import errorHandler from "../src/middleware/errorHandler.js";

function createMockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; }
    };
    return res;
}

describe("errorHandler middleware", () => {
    it("should return 500 for generic error", () => {
        const err = new Error("Something broke");
        const res = createMockRes();

        errorHandler(err, {}, res, () => {});

        assert.strictEqual(res.statusCode, 500);
        assert.strictEqual(res.body.error, "Something broke");
    });

    it("should use custom statusCode from error", () => {
        const err = new Error("Not Found");
        err.statusCode = 404;
        const res = createMockRes();

        errorHandler(err, {}, res, () => {});

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.body.error, "Not Found");
    });

    it("should handle non-Error objects", () => {
        const res = createMockRes();

        errorHandler("string error", {}, res, () => {});

        assert.strictEqual(res.statusCode, 500);
        assert.strictEqual(res.body.error, "string error");
    });
});
