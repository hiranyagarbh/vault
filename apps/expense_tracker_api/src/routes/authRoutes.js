import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../controllers/authController.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", rateLimiter, registerUser);
router.post("/login", rateLimiter, loginUser);
router.post("/refresh", rateLimiter, refreshAccessToken);
router.post("/logout", rateLimiter, logoutUser);
export default router;