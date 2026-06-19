import { Router } from "express"
import { createPost, getPosts, updatePost, deletePost, getPostById } from "../controllers/postController.js";

const router = Router();

router.post("/", createPost);

router.get("/", getPosts);
router.get("/:id", getPostById);

router.put("/:id", updatePost);

router.delete("/:id", deletePost);

export default router;