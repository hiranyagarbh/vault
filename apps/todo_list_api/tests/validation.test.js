import { describe, it } from "node:test";
import assert from "node:assert";
import { validateRegister, validateLogin, validateTodo, validatePagination, validateId } from "../src/utils/validation.js";

describe("validateRegister", () => {
    it("should return null for valid data", () => {
        const result = validateRegister("John", "john@example.com", "password123");
        assert.strictEqual(result, null);
    });

    it("should return error for invalid email", () => {
        const result = validateRegister("John", "invalid-email", "password123");
        assert.ok(result.error);
    });

    it("should return error for empty email", () => {
        const result = validateRegister("John", "", "password123");
        assert.ok(result.error);
    });

    it("should return error for too short password", () => {
        const result = validateRegister("John", "john@example.com", "123");
        assert.ok(result.error);
    });

    it("should return error for missing name", () => {
        const result = validateRegister("", "john@example.com", "password123");
        assert.ok(result.error);
    });

    it("should return error for undefined name", () => {
        const result = validateRegister(undefined, "john@example.com", "password123");
        assert.ok(result.error);
    });

    it("should return error for non-string name", () => {
        const result = validateRegister(123, "john@example.com", "password123");
        assert.ok(result.error);
    });
});

describe("validateLogin", () => {
    it("should return null for valid data", () => {
        const result = validateLogin("john@example.com", "password123");
        assert.strictEqual(result, null);
    });

    it("should return error for empty email", () => {
        const result = validateLogin("", "password123");
        assert.ok(result.error);
    });

    it("should return error for empty password", () => {
        const result = validateLogin("john@example.com", "");
        assert.ok(result.error);
    });

    it("should return error for invalid email", () => {
        const result = validateLogin("not-an-email", "password123");
        assert.ok(result.error);
    });

    it("should return error for password too short", () => {
        const result = validateLogin("john@example.com", "123");
        assert.ok(result.error);
    });
});

describe("validateTodo", () => {
    it("should return null for valid title and description", () => {
        const result = validateTodo("Buy groceries", "Milk and eggs");
        assert.strictEqual(result, null);
    });

    it("should return null for valid title without description", () => {
        const result = validateTodo("Buy groceries", undefined);
        assert.strictEqual(result, null);
    });

    it("should return error for missing title", () => {
        const result = validateTodo(undefined, "Milk and eggs");
        assert.ok(result.error);
    });

    it("should return error for empty title", () => {
        const result = validateTodo("", "Milk and eggs");
        assert.ok(result.error);
    });

    it("should return error for non-string title", () => {
        const result = validateTodo(123, "Milk and eggs");
        assert.ok(result.error);
    });

    it("should return error for non-string description", () => {
        const result = validateTodo("Buy groceries", 123);
        assert.ok(result.error);
    });
});

describe("validatePagination", () => {
    it("should return null for valid page and limit", () => {
        const result = validatePagination(1, 10);
        assert.strictEqual(result, null);
    });

    it("should return error for negative page", () => {
        const result = validatePagination(-1, 10);
        assert.ok(result.error);
    });

    it("should return error for negative limit", () => {
        const result = validatePagination(1, -5);
        assert.ok(result.error);
    });

    it("should return error for zero page", () => {
        const result = validatePagination(0, 10);
        assert.ok(result.error);
    });

    it("should return error for zero limit", () => {
        const result = validatePagination(1, 0);
        assert.ok(result.error);
    });

    it("should return error for non-number page", () => {
        const result = validatePagination("abc", 10);
        assert.ok(result.error);
    });

    it("should return error for non-number limit", () => {
        const result = validatePagination(1, "abc");
        assert.ok(result.error);
    });
});

describe("validateId", () => {
    it("should return null for valid id and userId", () => {
        const result = validateId(1, 1);
        assert.strictEqual(result, null);
    });

    it("should return error for negative id", () => {
        const result = validateId(-1, 1);
        assert.ok(result.error);
    });

    it("should return error for negative userId", () => {
        const result = validateId(1, -1);
        assert.ok(result.error);
    });

    it("should return error for zero id", () => {
        const result = validateId(0, 1);
        assert.ok(result.error);
    });

    it("should return error for non-number id", () => {
        const result = validateId("abc", 1);
        assert.ok(result.error);
    });

    it("should return error for undefined userId", () => {
        const result = validateId(1, undefined);
        assert.ok(result.error);
    });
});