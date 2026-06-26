import { Router } from "express";
import { createTodoHandler, getAllTodosHandler, getTodoByIdHandler, updateTodoHandler, deleteTodoHandler } from "../controllers/todoController.js";
import authenticate from "../middleware/auth.js";

const router = Router();
router.use(authenticate); // applies to ALL routes below this line

router.post("/todos", createTodoHandler);

router.get("/todos", getAllTodosHandler);
router.get("/todos/:id", getTodoByIdHandler);

router.put("/todos/:id", updateTodoHandler);

router.delete("/todos/:id", deleteTodoHandler);

export default router;