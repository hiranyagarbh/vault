import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import asyncHandler from "../utils/asyncHandler.js";



const mockReq = {};
let jsonCalled = false;
let jsonArg;
const mockRes = { json(obj) { jsonCalled = true; jsonArg = obj; } };


describe("asyncHandler", () => {
    beforeEach(() => {
        jsonCalled = false;
        jsonArg = undefined;
    });

    it("should handle successful async function", async () => {
        const next = () => { };
        // passing function that sends response
        const asyncFn = async (req, res, next) => {
            res.json({ message: "success" })
        }
        await asyncHandler(asyncFn)(mockReq, mockRes, next);
        assert.strictEqual(jsonCalled, true);
        assert.deepStrictEqual(jsonArg, { message: "success" });
    });

    it("should handle async function with error", async () => {
        let caughtError;
        const next = (err) => { caughtError = err };
        const asyncFn = async (req, res, next) => { throw new Error("failure") };

        await asyncHandler(asyncFn)(mockReq, mockRes, next);
        assert.strictEqual(caughtError.message, "failure");
    });
});
