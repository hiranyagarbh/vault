import './setup.js';
import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert";
import pool, { closeDatabase } from '../db/index.js';
import {
    createPost as createPostService,
    getAllPosts as getAllPostsService,
    getPostById as getPostByIdService,
    updatePost as updatePostService,
    deletePost as deletePostService
} from '../services/postService.js';


beforeEach(async () => { await pool.query('TRUNCATE TABLE blog_posts RESTART IDENTITY CASCADE'); });

after(async () => { await closeDatabase(); });

describe("services/postServices.js unit tests", () => {
    it("should create a post", async () => {
        const postData = {
            title: "Test Post",
            content: "Test Content",
            category: "Test Category",
            tags: ["Test Tag1", "Test Tag2"]
        };
        const post = await createPostService(postData);

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
        const post1 = await createPostService({
            title: "Post 1",
            content: "Content 1",
            category: "Category 1",
            tags: ["tag1"]
        });

        const post2 = await createPostService({
            title: "Post 2",
            content: "Content 2",
            category: "Category 2",
            tags: ["tag2"]
        });

        const posts = await getAllPostsService();
        assert.strictEqual(posts.length, 2);
        assert.strictEqual(posts[0].id, post2.id);
        assert.strictEqual(posts[1].id, post1.id);
    });

    it("should get a post by id", async () => {
        const created = await createPostService({
            title: "Test Post",
            content: "Test Content",
            category: "Test Category",
            tags: ["tag"]
        });

        const post = await getPostByIdService(created.id);
        assert.ok(post);
        assert.strictEqual(post.id, created.id);
        assert.strictEqual(post.title, "Test Post");

        const nonExistent = await getPostByIdService(9999);
        assert.strictEqual(nonExistent, undefined);
    });

    it("should update a post", async () => {
        const created = await createPostService({
            title: "Old Title",
            content: "Old Content",
            category: "Old Category",
            tags: ["old"]
        });

        const updated = await updatePostService(created.id, {
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
        const created = await createPostService({
            title: "To Be Deleted",
            content: "Content",
            category: "Category",
            tags: ["delete"]
        });

        const deleted = await deletePostService(created.id);
        assert.ok(deleted);
        assert.strictEqual(deleted.id, created.id);

        const post = await getPostByIdService(created.id);
        assert.strictEqual(post, undefined);

        const deleteNonExistent = await deletePostService(9999);
        assert.strictEqual(deleteNonExistent, undefined);
    });
});
