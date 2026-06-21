import './setup.js';
import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert";
import pool, { closeDatabase } from '../db/index.js';
import {
    createPost as createPostController,
    getPosts as getAllPostsController,
    getPostById as getPostByIdController,
    updatePost as updatePostController,
    deletePost as deletePostController
} from '../controllers/postController.js';

beforeEach(async () => { await pool.query('TRUNCATE TABLE blog_posts RESTART IDENTITY CASCADE'); });

after(async () => { await closeDatabase(); });

function mockResponse() {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    res.end = () => {
        return res;
    };
    return res;
}

async function seedPost(data) {
    const { title, content, category, tags } = data;
    const result = await pool.query(
        `INSERT INTO blog_posts (title, content, category, tags) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, content, category, JSON.stringify(tags)]
    );
    return result.rows[0];
}

// createPost
describe("createPostController unit tests", () => {
    it("should throw 400 if title is missing", async () => {
        const req = {
            body: {
                content: "Test Content",
                category: "Test Category",
                tags: ["Test Tag1", "Test Tag2"]
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "All fields are required");
    });

    it("should throw 400 if content is missing", async () => {
        const req = {
            body: {
                title: "Test Post",
                category: "Test Category",
                tags: ["Test Tag1", "Test Tag2"]
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "All fields are required");
    });

    it("should throw 400 if category is missing", async () => {
        const req = {
            body: {
                title: "Test Post",
                content: "Test Content",
                tags: ["Test Tag1", "Test Tag2"]
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "All fields are required");
    });

    it("should throw 400 if tags is missing", async () => {
        const req = {
            body: {
                title: "Test Post",
                content: "Test Content",
                category: "Test Category"
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "Tags must be an array");
    });

    it("should throw 400 if tags is not an array", async () => {
        const req = {
            body: {
                title: "Test Post",
                content: "Test Content",
                category: "Test Category",
                tags: "not-an-array"
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "Tags must be an array");
    });

    it("should create a post", async () => {
        const req = {
            body: {
                title: "Test Post",
                content: "Test Content",
                category: "Test Category",
                tags: ["Test Tag1", "Test Tag2"]
            }
        };
        const res = mockResponse();
        await createPostController(req, res);

        assert.strictEqual(res.statusCode, 201);
        assert.ok(res.body.id);
        assert.strictEqual(res.body.title, req.body.title);
        assert.strictEqual(res.body.content, req.body.content);
        assert.strictEqual(res.body.category, req.body.category);
        assert.deepStrictEqual(res.body.tags, req.body.tags);
        assert.ok(res.body.created_at);
        assert.ok(res.body.updated_at);

        const dbResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [res.body.id]);
        assert.strictEqual(dbResult.rows.length, 1);
    });
});

// getPosts
describe("getPostsController unit tests", () => {
    it("should get all posts", async () => {
        await seedPost({ title: "Post 1", content: "Content 1", category: "Category 1", tags: ["tag1"] });
        await seedPost({ title: "Post 2", content: "Content 2", category: "Category 2", tags: ["tag2"] });

        const req = { query: {} };
        const res = mockResponse();
        await getAllPostsController(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.length, 2);
    });

    it("should filter posts by search term", async () => {
        await seedPost({ title: "Match me", content: "some text", category: "Category 1", tags: [] });
        await seedPost({ title: "Ignore me", content: "some text", category: "Category 2", tags: [] });

        const req = { query: { term: "Match" } };
        const res = mockResponse();
        await getAllPostsController(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.length, 1);
        assert.strictEqual(res.body[0].title, "Match me");
    });
});

// getPostById
describe("getPostByIdController unit tests", () => {
    it("should throw 400 if id is not a number", async () => {
        const req = { params: { id: "invalid" } };
        const res = mockResponse();
        await getPostByIdController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "Post ID must be a valid positive integer");
    });

    it("should throw 404 if post id does not exist", async () => {
        const req = { params: { id: "9999" } };
        const res = mockResponse();
        await getPostByIdController(req, res);

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.body.error, "Post not found");
    });

    it("should get a post by id", async () => {
        const seeded = await seedPost({ title: "Test Post 1", content: "Test Content 1", category: "Test Category 1", tags: ["tag1"] });

        const req = { params: { id: String(seeded.id) } };
        const res = mockResponse();
        await getPostByIdController(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.id, seeded.id);
        assert.strictEqual(res.body.title, "Test Post 1");
    });
});

// updatePost
describe("updatePostController unit tests", () => {
    it("should throw 400 if id is not a number", async () => {
        const req = {
            params: { id: "invalid" },
            body: { title: "Title", content: "Content", category: "Category", tags: [] }
        };
        const res = mockResponse();
        await updatePostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "Post ID must be a valid positive integer");
    });

    it("should throw 404 if post id does not exist", async () => {
        const req = {
            params: { id: "9999" },
            body: { title: "Title", content: "Content", category: "Category", tags: [] }
        };
        const res = mockResponse();
        await updatePostController(req, res);

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.body.error, "Post not found");
    });

    it("should throw 400 if any field is missing", async () => {
        const seeded = await seedPost({ title: "Old", content: "Old", category: "Old", tags: [] });

        const req = {
            params: { id: String(seeded.id) },
            body: { content: "New Content", category: "New Category", tags: [] }
        };
        const res = mockResponse();
        await updatePostController(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.error, "All fields are required");
    });

    it("should update a post", async () => {
        const seeded = await seedPost({ title: "Old Title", content: "Old Content", category: "Old Category", tags: ["old"] });

        const req = {
            params: { id: String(seeded.id) },
            body: {
                title: "New Title",
                content: "New Content",
                category: "New Category",
                tags: ["new"]
            }
        };
        const res = mockResponse();
        await updatePostController(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.id, seeded.id);
        assert.strictEqual(res.body.title, "New Title");
        assert.strictEqual(res.body.content, "New Content");
        assert.strictEqual(res.body.category, "New Category");
        assert.deepStrictEqual(res.body.tags, ["new"]);
    });
});

// deletePost
describe("deletePostController unit tests", () => {
    it("should delete a post", async () => {
        const seeded = await seedPost({ title: "To Be Deleted", content: "Content", category: "Category", tags: ["delete"] });

        const req = { params: { id: String(seeded.id) } };
        const res = mockResponse();
        await deletePostController(req, res);

        assert.strictEqual(res.statusCode, 204);

        const dbResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [seeded.id]);
        assert.strictEqual(dbResult.rows.length, 0);
    });

    it("should return 404 when deleting non-existent id", async () => {
        const req = { params: { id: "9999" } };
        const res = mockResponse();
        await deletePostController(req, res);

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.body.error, "Post not found");
    });
});