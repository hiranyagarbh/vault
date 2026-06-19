import {
    createPost as createPostService,
    getAllPosts as getAllPostsService,
    searchPosts as searchPostsService,
    getPostById as getPostByIdService,
    updatePost as updatePostService,
    deletePost as deletePostService
} from '../services/postService.js';

function checkId(id) {
    if (!id) return { success: false, error: "Post ID is required" };
    if (!/^\d+$/.test(id)) return { success: false, error: "Post ID must be a valid positive integer" };
    return { success: true, data: parseInt(id, 10) };
}

function checkPost(post) {
    if (post === null || post === undefined) return { success: false, error: "Post not found" };
    return { success: true, data: post };
}

function checkTags(tags) {
    if (!Array.isArray(tags)) return { success: false, error: "Tags must be an array" };
    return { success: true, data: tags };
}

export async function createPost(req, res, next) {
    const { title, content, category, tags } = req?.body || {};
    const checkedTags = checkTags(tags);
    if (!checkedTags.success) { return res.status(400).json({ error: checkedTags.error }); }

    if (!title || !content || !category || !tags) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const post = await createPostService({ title, content, category, tags: checkedTags.data });
    const checkedPost = checkPost(post);
    if (!checkedPost.success) { return res.status(500).json({ error: "Failed to create post" }); }
    return res.status(201).json(checkedPost.data);
}

export async function getPosts(req, res, next) {
    const { term } = req?.query || {};

    if (term) {
        const posts = await searchPostsService(term);
        return res.status(200).json(posts);
    }
    const posts = await getAllPostsService();
    return res.status(200).json(posts);
}

export async function getPostById(req, res, next) {
    const { id } = req?.params || {};
    const validatedId = checkId(id);
    if (!validatedId.success) { return res.status(400).json({ error: validatedId.error }); }

    const post = await getPostByIdService(validatedId.data);
    const checkedPost = checkPost(post);
    if (!checkedPost.success) { return res.status(404).json({ error: checkedPost.error }); }
    return res.status(200).json(checkedPost.data);
}

export async function updatePost(req, res, next) {
    const { id } = req?.params || {};
    const { title, content, category, tags } = req?.body || {};
    const validatedId = checkId(id);
    if (!validatedId.success) { return res.status(400).json({ error: validatedId.error }); }

    if (!title || !content || !category || !tags) { return res.status(400).json({ error: "All fields are required" }); }
    const checkedTags = checkTags(tags);
    if (!checkedTags.success) { return res.status(400).json({ error: checkedTags.error }); }

    const post = await updatePostService(validatedId.data, { title, content, category, tags: checkedTags.data });
    const checkedPost = checkPost(post);
    if (!checkedPost.success) { return res.status(404).json({ error: checkedPost.error }); }
    return res.status(200).json(checkedPost.data);
}

export async function deletePost(req, res, next) {
    const { id } = req?.params || {};
    const validatedId = checkId(id);
    if (!validatedId.success) { return res.status(400).json({ error: validatedId.error }); }

    const post = await deletePostService(validatedId.data);
    const checkedPost = checkPost(post);
    if (!checkedPost.success) { return res.status(404).json({ error: checkedPost.error }); }
    return res.status(204).end();
}

