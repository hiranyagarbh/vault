import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", rateLimiter, registerUser);
router.post("/login", rateLimiter, loginUser);

export default router;