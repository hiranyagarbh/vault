import './setup.js';
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import app from '../app.js';
import pool, { closeDatabase } from '../db/index.js';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}/api/posts`;
let server;

before(async () => {
    await new Promise((resolve) => {
        server = app.listen(PORT, () => {
            resolve();
        });
    });
});

beforeEach(async () => {
    await pool.query('TRUNCATE TABLE blog_posts RESTART IDENTITY CASCADE');
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
});

describe("postsRoute integration tests", () => {
    it("POST / - should create a new post and return 201 with the post", async () => {
        const postData = {
            title: "Test Post",
            content: "Test Content",
            category: "Test Category",
            tags: ["Test Tag1", "Test Tag2"]
        };

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });

        assert.strictEqual(response.status, 201);
        const body = await response.json();

        assert.strictEqual(body.title, "Test Post");
        assert.strictEqual(body.content, "Test Content");
        assert.strictEqual(body.category, "Test Category");
        assert.deepStrictEqual(body.tags, ["Test Tag1", "Test Tag2"]);
        assert.ok(body.id);
        assert.ok(body.created_at);
        assert.ok(body.updated_at);
    });

    it("POST / - should return 400 if title is missing", async () => {
        const postData = {
            content: "Test Content",
            category: "Test Category",
            tags: ["Test Tag1"]
        };

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });

        assert.strictEqual(response.status, 400);
        const body = await response.json();
        assert.strictEqual(body.error, "All fields are required");
    });

    it("GET / - should get all posts", async () => {
        // Seed a post
        await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Test Post",
                content: "Test Content",
                category: "Test Category",
                tags: ["tag"]
            })
        });

        const response = await fetch(BASE_URL);
        assert.strictEqual(response.status, 200);

        const body = await response.json();
        assert.strictEqual(body.length, 1);
        assert.strictEqual(body[0].title, "Test Post");
    });

    it("GET / - should search posts by term", async () => {
        // Seed two posts
        await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "JavaScript Tips",
                content: "Variables and scopes",
                category: "Programming",
                tags: ["js"]
            })
        });

        await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Python Tips",
                content: "Lists and dicts",
                category: "Programming",
                tags: ["python"]
            })
        });

        const response = await fetch(`${BASE_URL}?term=JavaScript`);
        assert.strictEqual(response.status, 200);

        const body = await response.json();
        assert.strictEqual(body.length, 1);
        assert.strictEqual(body[0].title, "JavaScript Tips");
    });

    it("GET /:id - should get a post by id", async () => {
        const seedRes = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Unique Post",
                content: "Test Content",
                category: "Test Category",
                tags: ["unique"]
            })
        });
        const seedBody = await seedRes.json();
        const id = seedBody.id;

        const response = await fetch(`${BASE_URL}/${id}`);
        assert.strictEqual(response.status, 200);

        const body = await response.json();
        assert.strictEqual(body.title, "Unique Post");
    });

    it("GET /:id - should return 404 for non-existent post id", async () => {
        const response = await fetch(`${BASE_URL}/9999`);
        assert.strictEqual(response.status, 404);

        const body = await response.json();
        assert.strictEqual(body.error, "Post not found");
    });

    it("PUT /:id - should update a post and return the updated post", async () => {
        const seedRes = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Old Title",
                content: "Old Content",
                category: "Old Category",
                tags: ["old"]
            })
        });
        const seedBody = await seedRes.json();
        const id = seedBody.id;

        const postData = {
            title: "Updated Post",
            content: "Updated Content",
            category: "Updated Category",
            tags: ["Updated Tag1", "Updated Tag2"]
        };

        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData)
        });

        assert.strictEqual(response.status, 200);
        const body = await response.json();

        assert.strictEqual(body.title, "Updated Post");
        assert.strictEqual(body.content, "Updated Content");
        assert.strictEqual(body.category, "Updated Category");
        assert.deepStrictEqual(body.tags, ["Updated Tag1", "Updated Tag2"]);
    });

    it("DELETE /:id - should delete a post and return 204", async () => {
        const seedRes = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Delete Me",
                content: "Soon to be deleted",
                category: "Trash",
                tags: ["temp"]
            })
        });
        const seedBody = await seedRes.json();
        const id = seedBody.id;

        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE"
        });
        assert.strictEqual(response.status, 204);

        const verifyResponse = await fetch(`${BASE_URL}/${id}`);
        assert.strictEqual(verifyResponse.status, 404);
    });
});
