import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { getAllArticles, getArticle, createArticle, updateArticle, deleteArticle } from "../articles.js";

let tempFolder;
describe("Article Tests", () => {
    before(async () => {
        tempFolder = await mkdtemp(join(tmpdir(), 'articles-test-'));
        console.log("Created temp folder:", tempFolder);
    });
    after(async () => {
        await rm(tempFolder, { recursive: true, force: true });
        console.log("Deleted temp folder:", tempFolder);
    });

    test("Should create an article", async () => {
        const articleId = await createArticle(tempFolder, { title: "Test Title", body: "Test Content" });
        assert.strictEqual(typeof articleId, "number", "Should return an integer");
    })
    test("Should get all articles", async () => {
        await createArticle(tempFolder, { title: "Test Title", body: "Test Content" });
        const articles = await getAllArticles(tempFolder);
        assert.strictEqual(Array.isArray(articles), true, "Should return an array");
    })
    test("Should get an article", async () => {
        const articleId = await createArticle(tempFolder, { title: "Test Title", body: "Test Content" });
        const article = await getArticle(tempFolder, String(articleId));
        assert.strictEqual(typeof article, "object", "Should return an object");
        assert.strictEqual(Number(article.id), articleId, "Id should match");
        assert.strictEqual(article.title, "Test Title", "Title should match");
        assert.strictEqual(article.body, "Test Content", "Body should match");
        assert.ok(article.createdAt, "CreatedAt should exist");
        assert.strictEqual(typeof article.createdAt, "string", "CreatedAt should be a string");
    })
    test("Should update an article", async () => {
        const articleId = await createArticle(tempFolder, { title: "Test Title", body: "Test Content" });
        const res = await updateArticle(tempFolder, String(articleId), { title: "Test Title1", body: "Test Content1" });
        assert.strictEqual(res, true, "Should return true");
        const article = await getArticle(tempFolder, String(articleId));
        assert.strictEqual(article.title, "Test Title1", "Title should match");
        assert.strictEqual(article.body, "Test Content1", "Body should match");
        assert.ok(article.createdAt, "CreatedAt should exist");
        assert.strictEqual(typeof article.createdAt, "string", "CreatedAt should be a string");
        assert.ok(article.updatedAt, "UpdatedAt should exist");
        assert.strictEqual(typeof article.updatedAt, "string", "UpdatedAt should be a string");
    })
    test("Should delete an article", async () => {
        const articleId = await createArticle(tempFolder, { title: "Test Title", body: "Test Content" });
        const res = await deleteArticle(tempFolder, String(articleId));
        assert.strictEqual(res, true, "Should return true");
        const article = await getArticle(tempFolder, String(articleId));
        assert.strictEqual(article, null, "Should return null");
    })
});