import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { getAllArticles, getArticle, createArticle, updateArticle, deleteArticle } from "../articles.js";

let tempFolder;

// fresh temp folder per test - no leaked state
beforeEach(async () => {
    tempFolder = await mkdtemp(join(tmpdir(), "articles-test-"));
});
afterEach(async () => {
    await rm(tempFolder, { recursive: true, force: true });
});

describe("createArticle", () => {
    test("returns numeric ID", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        assert.strictEqual(typeof id, "number");
    });

    test("first article in empty folder gets ID 1", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        assert.strictEqual(id, 1);
    });

    test("IDs auto-increment", async () => {
        const id1 = await createArticle(tempFolder, { title: "A", body: "a" });
        const id2 = await createArticle(tempFolder, { title: "B", body: "b" });
        const id3 = await createArticle(tempFolder, { title: "C", body: "c" });
        assert.strictEqual(id1, 1);
        assert.strictEqual(id2, 2);
        assert.strictEqual(id3, 3);
    });

    test("stores title and body correctly", async () => {
        const id = await createArticle(tempFolder, { title: "My Title", body: "My Body" });
        const article = await getArticle(tempFolder, String(id));
        assert.strictEqual(article.title, "My Title");
        assert.strictEqual(article.body, "My Body");
    });

    test("sets createdAt and updatedAt as ISO strings", async () => {
        const before = new Date().toISOString();
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const after = new Date().toISOString();
        const article = await getArticle(tempFolder, String(id));

        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        assert.match(article.createdAt, isoRegex, "createdAt should be ISO format");
        assert.match(article.updatedAt, isoRegex, "updatedAt should be ISO format");
        assert.ok(article.createdAt >= before && article.createdAt <= after, "createdAt should be within test window");
    });

    test("ID increments past deleted articles (no reuse)", async () => {
        const id1 = await createArticle(tempFolder, { title: "A", body: "a" });
        await createArticle(tempFolder, { title: "B", body: "b" });
        await deleteArticle(tempFolder, String(id1));
        const id3 = await createArticle(tempFolder, { title: "C", body: "c" });
        assert.strictEqual(id3, 3); // max existing is 2, so next should be 3
    });
});

describe("getArticle", () => {
    test("returns article with correct shape", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const article = await getArticle(tempFolder, String(id));
        assert.deepStrictEqual(Object.keys(article).sort(), ["body", "createdAt", "id", "title", "updatedAt"]);
    });

    test("returns correct id as string", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const article = await getArticle(tempFolder, String(id));
        assert.strictEqual(article.id, String(id));
    });

    test("returns null for nonexistent ID", async () => {
        const result = await getArticle(tempFolder, "999");
        assert.strictEqual(result, null);
    });

    test("returns null for nonexistent folder", async () => {
        const result = await getArticle("/nonexistent/path", "1");
        assert.strictEqual(result, null);
    });
});

describe("getAllArticles", () => {
    test("returns empty array for empty folder", async () => {
        const articles = await getAllArticles(tempFolder);
        assert.deepStrictEqual(articles, []);
    });

    test("returns empty array for nonexistent folder", async () => {
        const articles = await getAllArticles("/nonexistent/path");
        assert.deepStrictEqual(articles, []);
    });

    test("returns correct count", async () => {
        await createArticle(tempFolder, { title: "A", body: "a" });
        await createArticle(tempFolder, { title: "B", body: "b" });
        await createArticle(tempFolder, { title: "C", body: "c" });
        const articles = await getAllArticles(tempFolder);
        assert.strictEqual(articles.length, 3);
    });

    test("each article has id, title, shortDate (no body)", async () => {
        await createArticle(tempFolder, { title: "Test", body: "Content" });
        const articles = await getAllArticles(tempFolder);
        const article = articles[0];
        assert.ok(article.id, "should have id");
        assert.ok(article.title, "should have title");
        assert.ok(article.shortDate, "should have shortDate");
        assert.strictEqual(article.body, undefined, "should NOT include body");
        assert.strictEqual(article.createdAt, undefined, "should NOT include createdAt");
    });

    test("shortDate is YYYY-MM-DD format", async () => {
        await createArticle(tempFolder, { title: "T", body: "B" });
        const articles = await getAllArticles(tempFolder);
        assert.match(articles[0].shortDate, /^\d{4}-\d{2}-\d{2}$/);
    });

    test("reflects deletions", async () => {
        const id1 = await createArticle(tempFolder, { title: "A", body: "a" });
        await createArticle(tempFolder, { title: "B", body: "b" });
        await deleteArticle(tempFolder, String(id1));
        const articles = await getAllArticles(tempFolder);
        assert.strictEqual(articles.length, 1);
        assert.strictEqual(articles[0].title, "B");
    });
});

describe("updateArticle", () => {
    test("returns true on success", async () => {
        const id = await createArticle(tempFolder, { title: "Old", body: "Old" });
        const result = await updateArticle(tempFolder, String(id), { title: "New", body: "New" });
        assert.strictEqual(result, true);
    });

    test("updates title and body", async () => {
        const id = await createArticle(tempFolder, { title: "Old", body: "Old body" });
        await updateArticle(tempFolder, String(id), { title: "New", body: "New body" });
        const article = await getArticle(tempFolder, String(id));
        assert.strictEqual(article.title, "New");
        assert.strictEqual(article.body, "New body");
    });

    test("preserves original createdAt", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const original = await getArticle(tempFolder, String(id));
        // small delay so updatedAt differs
        await new Promise((r) => setTimeout(r, 10));
        await updateArticle(tempFolder, String(id), { title: "X", body: "Y" });
        const updated = await getArticle(tempFolder, String(id));
        assert.strictEqual(updated.createdAt, original.createdAt, "createdAt should not change");
    });

    test("updates updatedAt timestamp", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const original = await getArticle(tempFolder, String(id));
        await new Promise((r) => setTimeout(r, 10));
        await updateArticle(tempFolder, String(id), { title: "X", body: "Y" });
        const updated = await getArticle(tempFolder, String(id));
        assert.ok(updated.updatedAt > original.updatedAt, "updatedAt should be newer");
    });

    test("throws on nonexistent article", async () => {
        await assert.rejects(
            () => updateArticle(tempFolder, "999", { title: "X", body: "Y" }),
            "should throw when article doesn't exist"
        );
    });
});

describe("deleteArticle", () => {
    test("returns true on success", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        const result = await deleteArticle(tempFolder, String(id));
        assert.strictEqual(result, true);
    });

    test("article no longer retrievable after delete", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        await deleteArticle(tempFolder, String(id));
        const article = await getArticle(tempFolder, String(id));
        assert.strictEqual(article, null);
    });

    test("returns false for nonexistent article", async () => {
        const result = await deleteArticle(tempFolder, "999");
        assert.strictEqual(result, false);
    });

    test("double delete returns false", async () => {
        const id = await createArticle(tempFolder, { title: "T", body: "B" });
        await deleteArticle(tempFolder, String(id));
        const result = await deleteArticle(tempFolder, String(id));
        assert.strictEqual(result, false);
    });

    test("does not affect other articles", async () => {
        const id1 = await createArticle(tempFolder, { title: "Keep", body: "a" });
        const id2 = await createArticle(tempFolder, { title: "Delete", body: "b" });
        await deleteArticle(tempFolder, String(id2));
        const remaining = await getArticle(tempFolder, String(id1));
        assert.strictEqual(remaining.title, "Keep");
    });
});