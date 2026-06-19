import {
    createPost as createPostService,
    getAllPosts as getAllPostsService,
    searchPosts as searchPostsService,
    getPostById as getPostByIdService,
    updatePost as updatePostService,
    deletePost as deletePostService
} from '../services/postService.js'

function checkPost(post) {
    if (post === null || post === undefined) return { success: false, message: "Post not found" };
    if (Array.isArray(post) && post.length === 0) return { success: false, message: "No posts found" };
    return { success: true, data: post };
}

export async function createPost(req, res, next) {
    const { title, content, category, tags } = req?.body || {};
    if (!title || !content || !category || !tags) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    try {
        const post = await createPostService({ title, content, category, tags });
        const checkedPost = checkPost(post);
        if (!checkedPost.success) { return res.status(500).json({ success: false, message: "Failed to create post" }); }
        return res.status(201).json({ success: true, data: checkedPost.data });
    } catch (error) { next(error); }
}

export async function getPosts(req, res, next) {
    const { term } = req?.query || {};
    try {
        if (term) {
            const posts = await searchPostsService(term);
            const checkedPost = checkPost(posts);
            if (!checkedPost.success) { return res.status(200).json({ success: true, data: [] }); }
            return res.status(200).json({ success: true, data: checkedPost.data });
        }
        const posts = await getAllPostsService();
        const checkedPost = checkPost(posts);
        if (!checkedPost.success) { return res.status(200).json({ success: true, data: [] }); }
        return res.status(200).json({ success: true, data: checkedPost.data });
    } catch (error) { next(error); }
}

export async function getPostById(req, res, next) {
    const { id } = req?.params || {};
    if (!id) { return res.status(400).json({ success: false, message: "Post ID is required" }); }
    try {
        const post = await getPostByIdService(id);
        const checkedPost = checkPost(post);
        if (!checkedPost.success) { return res.status(404).json({ success: false, message: "Post not found" }); }
        return res.status(200).json({ success: true, data: checkedPost.data });
    } catch (error) { next(error); }
}

export async function updatePost(req, res, next) {
    const { id } = req?.params || {};
    const { title, content, category, tags } = req?.body || {};
    if (!id) { return res.status(400).json({ success: false, message: "Post ID is required" }); }
    if (!title && !content && !category && !tags) { return res.status(400).json({ success: false, message: "At least one field is required" }); }
    try {
        const post = await updatePostService(id, { title, content, category, tags });
        const checkedPost = checkPost(post);
        if (!checkedPost.success) { return res.status(404).json({ success: false, message: "Post not found" }); }
        return res.status(200).json({ success: true, data: checkedPost.data });
    } catch (error) { next(error); }
}

export async function deletePost(req, res, next) {
    const { id } = req?.params || {};
    if (!id) { return res.status(400).json({ success: false, message: "Post ID is required" }); }
    try {
        const post = await deletePostService(id);
        const checkedPost = checkPost(post);
        if (!checkedPost.success) { return res.status(404).json({ success: false, message: "Post not found" }); }
        return res.status(204).end();
    } catch (error) { next(error); }
}
