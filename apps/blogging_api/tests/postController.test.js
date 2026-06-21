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
} from '../controllers/postController.js'

beforeEach(async () => { await pool.query('TRUNCATE TABLE blog_posts RESTART IDENTITY CASCADE'); });

after(async () => { await closeDatabase(); });

// createPost
describe("createPostController unit tests", () => {
    it("should throw 400 if title is missing", async () => {
        const postData = {
            content: "Test Content",
            category: "Test Category",
            tags: ["Test Tag1", "Test Tag2"]
        };
        const response = await createPostController(postData);
        assert.strictEqual(response.status, 400);
    });
    it("should throw 400 if content is missing", async () => {
        const postData = {
            title: "Test Post",
            category: "Test Category",
            tags: ["Test Tag1", "Test Tag2"]
        };
        const response = await createPostController(postData);
        assert.strictEqual(response.status, 400);
    });
    it("should throw 400 if category is missing", async () => {
        const postData = {
            title: "Test Post",
            content: "Test Content",
            tags: ["Test Tag1", "Test Tag2"]
        };
        const response = await createPostController(postData);
        assert.strictEqual(response.status, 400);
    });
    it("should throw 400 if tags is missing", async () => {
        const postData = {
            title: "Test Post",
            content: "Test Content",
            category: "Test Category"
        };
        const response = await createPostController(postData);
        assert.strictEqual(response.status, 400);
    });
    it("should create a post", async () => {
        const postData = {
            title: "Test Post",
            content: "Test Content",
            category: "Test Category",
            tags: ["Test Tag1", "Test Tag2"]
        };
        const post = await createPostController(postData);

        assert.ok(post.id);
        assert.strictEqual(post.title, postData.title);
        assert.strictEqual(post.content, postData.content);
        assert.strictEqual(post.category, postData.category);
        assert.deepStrictEqual(post.tags, postData.tags);
        assert.ok(post.created_at);
        assert.ok(post.updated_at);

        const dbResult = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [post.id]);
        assert.strictEqual(dbResult.rows.length, 1);
        assert.strictEqual(dbResult.rows[0].title, postData.title);
    });
    it("should get all posts in descending order of created_at", async () => {
        const post1 = await createPostController({
            title: "Post 1",
            content: "Content 1",
            category: "Category 1",
            tags: ["tag1"]
        });

        const post2 = await createPostController({
            title: "Post 2",
            content: "Content 2",
            category: "Category 2",
            tags: ["tag2"]
        });

        const posts = await getAllPostsController();
        assert.strictEqual(posts.length, 2);
        assert.strictEqual(posts[0].id, post2.id);
        assert.strictEqual(posts[1].id, post1.id);
    });
})

// getPosts
describe("getPostsController unit tests", () => {
    it("should get all posts", async () => {
        const post1 = await createPostController({ title: "Post 1", content: "Content 1", category: "Category 1", tags: ["tag1"] });
        const post2 = await createPostController({ title: "Post 2", content: "Content 2", category: "Category 2", tags: ["tag2"] });

        const posts = await getAllPostsController();
        assert.ok(posts);
        assert.strictEqual(posts.length, 2);
        assert.strictEqual(posts[0].id, post2.id);
        assert.strictEqual(posts[1].id, post1.id);

        const { response } = await getAllPostsController({ term: "test" });
        assert.ok(response);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.length, 2);
        assert.strictEqual(response.body[0].id, post2.id);
        assert.strictEqual(response.body[1].id, post1.id);
    });

    it("should get an empty array when no posts are present", async () => {
        const posts = await getAllPostsController();
        assert.ok(posts);
        assert.strictEqual(posts.length, 0);
    });
});

// getPostById
describe("getPostByIdController unit tests", () => {
    it("should throw 400 if id is not a number", async () => {
        const response = await getPostByIdController("invalid");
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Invalid post ID");
    });
    it("should throw 404 if post id does not exist", async () => {
        const response = await getPostByIdController(9999);
        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.body, "Post not found");
    });
    it("should get a post by id", async () => {
        const createdPost1 = await createPostController({ title: "Test Post 1", content: "Test Content 1", category: "Test Category 1", tags: ["tag1"] });
        const createdPost2 = await createPostController({ title: "Test Post 2", content: "Test Content 2", category: "Test Category 2", tags: ["tag2"] });

        const post1 = await getPostByIdController(createdPost1.id);
        assert.ok(post1);
        assert.strictEqual(post1.id, createdPost1.id);
        assert.strictEqual(post1.title, "Test Post 1");

        const post2 = await getPostByIdController(createdPost2.id);
        assert.ok(post2);
        assert.strictEqual(post2.id, createdPost2.id);
        assert.strictEqual(post2.title, "Test Post 2");

        const nonExistent = await getPostByIdController(9999);
        assert.strictEqual(nonExistent, undefined);
    });
})

// updatePost
describe("updatePostController unit tests", () => {
    it("should throw 400 if id is not a number", async () => {
        const response = await updatePostController("invalid", {
            title: "New Title",
            content: "New Content",
            category: "New Category",
            tags: ["new"]
        });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Invalid post ID");
    });
    it("should throw 404 if post id does not exist", async () => {
        const response = await updatePostController(9999, {
            title: "New Title",
            content: "New Content",
            category: "New Category",
            tags: ["new"]
        });
        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.body, "Post not found");
    });
    it("should throw 400 if title is missing", async () => {
        const created = await createPostController({ title: "Old Title", content: "Old Content", category: "Old Category", tags: ["old"] });
        const response = await updatePostController(created.id, { content: "New Content", category: "New Category", tags: ["new"] });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Title is required");
    });
    it("should throw 400 if content is missing", async () => {
        const created = await createPostController({ title: "Old Title", content: "Old Content", category: "Old Category", tags: ["old"] });
        const response = await updatePostController(created.id, { title: "New Title", category: "New Category", tags: ["new"] });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Content is required");
    });
    it("should throw 400 if category is missing", async () => {
        const created = await createPostController({ title: "Old Title", content: "Old Content", category: "Old Category", tags: ["old"] });
        const response = await updatePostController(created.id, { title: "New Title", content: "New Content", tags: ["new"] });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Category is required");
    });
    it("should throw 400 if tags is missing", async () => {
        const created = await createPostController({ title: "Old Title", content: "Old Content", category: "Old Category", tags: ["old"] });
        const response = await updatePostController(created.id, { title: "New Title", content: "New Content", category: "New Category" });
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body, "Tags are required");
    });
    it("should update a post", async () => {
        const created = await createPostController({
            title: "Old Title",
            content: "Old Content",
            category: "Old Category",
            tags: ["old"]
        });

        const updated = await updatePostController(created.id, {
            title: "New Title",
            content: "New Content",
            category: "New Category",
            tags: ["new"]
        });

        assert.ok(updated);
        assert.strictEqual(updated.id, created.id);
        assert.strictEqual(updated.title, "New Title");
        assert.strictEqual(updated.content, "New Content");
        assert.strictEqual(updated.category, "New Category");
        assert.deepStrictEqual(updated.tags, ["new"]);
    });

    it("should delete a post", async () => {
        const created = await createPostController({ title: "To Be Deleted", content: "Content", category: "Category", tags: ["delete"] });

        const deleted = await deletePostController(created.id);
        assert.ok(deleted);
        assert.strictEqual(deleted.id, created.id);

        const post = await getPostByIdController(created.id);
        assert.strictEqual(post, undefined);

        const deleteNonExistent = await deletePostController(9999);
        assert.strictEqual(deleteNonExistent, undefined);
    });
});