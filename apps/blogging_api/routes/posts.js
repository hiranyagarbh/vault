import { Router } from "express"
import { createPost, getPosts, updatePost, deletePost, getPostById } from "../controllers/postController.js";

const router = Router();

router.post("/", createPost);
router.get("/", getPosts);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.get("/:id", getPostById);

export default router;